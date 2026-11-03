const API = "/viagem";
const state = {
    allTrips: [],
    visibleTrips: [],
    selectedTrip: null,
    searchTerm: "",
    searchMode: "partial"
};

const el = (id) => document.getElementById(id);
const form = el("trip-form");

function setConnection(status, label) {
    const dot = el("connection-dot");
    dot.classList.remove("connected", "disconnected");
    if (status === "connected") dot.classList.add("connected");
    if (status === "disconnected") dot.classList.add("disconnected");
    el("connection-label").textContent = label;
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast${type === "error" ? " error" : type === "info" ? " info" : ""}`;
    toast.textContent = message;
    el("toast-region").append(toast);
    window.setTimeout(() => toast.remove(), 4200);
}

async function apiRequest(path, options = {}) {
    let response;
    try {
        response = await fetch(path, {
            ...options,
            headers: {
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...(options.headers || {})
            }
        });
    } catch (error) {
        setConnection("disconnected", "Backend indisponível");
        throw new Error("Não consegui conectar à API. Confirme que a aplicação Spring Boot está rodando.");
    }

    const text = await response.text();
    let data = null;
    if (text) {
        try { data = JSON.parse(text); }
        catch { data = text; }
    }

    if (!response.ok) {
        const message = (data && typeof data === "object" && (data.erro || data.message || data.error))
            || (typeof data === "string" && data)
            || `A API respondeu com erro ${response.status}.`;
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    setConnection("connected", "Conectado ao servidor");
    return { status: response.status, data };
}

function updateStats(trips) {
    const destinations = new Set(trips.map((trip) => (trip.destino || "").trim().toLocaleLowerCase("pt-BR")).filter(Boolean));
    const budget = trips.reduce((sum, trip) => sum + (Number(trip.preco) || 0), 0);
    el("stat-total").textContent = trips.length.toLocaleString("pt-BR");
    el("stat-destinations").textContent = destinations.size.toLocaleString("pt-BR");
    el("stat-budget").textContent = budget.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    el("nav-count").textContent = trips.length.toLocaleString("pt-BR");
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function formatPrice(value) {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : String(value);
}

function setVisibleTrips(trips) {
    state.visibleTrips = Array.isArray(trips) ? trips : [];
    el("list-count").textContent = state.visibleTrips.length.toLocaleString("pt-BR");
    renderTrips(state.visibleTrips);
    const search = state.searchTerm;
    el("search-caption").textContent = search
        ? `Resultados para “${search}” · ${state.searchMode === "exact" ? "destino exato" : "contém"}`
        : "Todas as viagens";
    el("delete-destination-button").hidden = !(search && state.searchMode === "exact");
}

function makeCell(className, text) {
    const td = document.createElement("td");
    if (className) td.className = className;
    if (text !== undefined) td.textContent = text;
    return td;
}

function renderTrips(trips) {
    const body = el("trip-list");
    body.replaceChildren();
    el("empty-state").hidden = trips.length !== 0;
    document.querySelector(".table-wrap").hidden = trips.length === 0;

    trips.forEach((trip) => {
        const row = document.createElement("tr");
        const destinationCell = makeCell("destination-cell");
        const destination = document.createElement("span");
        destination.className = "destination-name";
        destination.textContent = trip.destino || "Destino sem nome";
        const identifier = document.createElement("span");
        identifier.className = "destination-id";
        identifier.textContent = `CÓDIGO #${trip.id}`;
        destinationCell.append(destination, identifier);

        const periodCell = makeCell("");
        const period = document.createElement("span");
        period.className = "period-text";
        period.textContent = `${formatDate(trip.dataIda)} — ${formatDate(trip.dataVolta)}`;
        const days = document.createElement("span");
        days.className = "period-days";
        const start = trip.dataIda ? new Date(`${trip.dataIda}T00:00:00`) : null;
        const end = trip.dataVolta ? new Date(`${trip.dataVolta}T00:00:00`) : null;
        const numberDays = start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
            ? Math.max(1, Math.round((end - start) / 86400000) + 1)
            : null;
        days.textContent = numberDays ? `${numberDays} ${numberDays === 1 ? "dia" : "dias"}` : "período da viagem";
        periodCell.append(period, days);

        const priceCell = makeCell("");
        const price = document.createElement("span");
        price.className = "price-text";
        price.textContent = formatPrice(trip.preco);
        priceCell.append(price);

        const actionsCell = makeCell("");
        const actions = document.createElement("div");
        actions.className = "row-actions";
        const detailButton = actionButton("Ver viagem", "⌕", () => showTripDetails(trip.id));
        const editButton = actionButton("Editar viagem", "✎", () => beginEdit(trip));
        const deleteButton = actionButton("Excluir viagem", "×", () => deleteById(trip));
        deleteButton.classList.add("danger");
        actions.append(detailButton, editButton, deleteButton);
        actionsCell.append(actions);
        row.append(destinationCell, periodCell, priceCell, actionsCell);
        body.append(row);
    });
}

function actionButton(title, label, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-button";
    button.title = title;
    button.setAttribute("aria-label", title);
    button.textContent = label;
    button.addEventListener("click", callback);
    return button;
}

async function refreshTrips() {
    el("last-updated").textContent = "Atualizando...";
    try {
        const allResponse = await apiRequest(API);
        state.allTrips = Array.isArray(allResponse.data) ? allResponse.data : [];
        updateStats(state.allTrips);

        if (!state.searchTerm.trim()) {
            setVisibleTrips(state.allTrips);
        } else if (state.searchMode === "partial") {
            const url = `${API}/pesquisa?destino=${encodeURIComponent(state.searchTerm.trim())}`;
            const searchResponse = await apiRequest(url);
            setVisibleTrips(Array.isArray(searchResponse.data) ? searchResponse.data : []);
        } else {
            const url = `${API}/destino/${encodeURIComponent(state.searchTerm.trim())}`;
            try {
                const searchResponse = await apiRequest(url);
                setVisibleTrips(searchResponse.data ? [searchResponse.data] : []);
            } catch (error) {
                if (error.status === 404) setVisibleTrips([]);
                else throw error;
            }
        }
        el("last-updated").textContent = `Atualizado às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch (error) {
        setConnection("disconnected", "Backend indisponível");
        el("last-updated").textContent = "Falha ao atualizar";
        if (!state.allTrips.length) {
            const body = el("trip-list");
            body.replaceChildren();
            const row = document.createElement("tr");
            const cell = makeCell("table-state", error.message);
            cell.colSpan = 4;
            row.append(cell);
            body.append(row);
            document.querySelector(".table-wrap").hidden = false;
            el("empty-state").hidden = true;
        }
        showToast(error.message, "error");
    }
}

function readForm() {
    return {
        destino: el("destino").value.trim(),
        dataIda: el("dataIda").value,
        dataVolta: el("dataVolta").value,
        preco: Number(el("preco").value),
        observacoes: el("observacoes").value.trim()
    };
}

function validateTrip(trip) {
    if (!trip.destino) return "Informe o destino da viagem.";
    if (!trip.dataIda || !trip.dataVolta) return "Informe as datas de ida e volta.";
    if (trip.dataVolta < trip.dataIda) return "A volta não pode acontecer antes da ida.";
    if (!Number.isFinite(trip.preco) || trip.preco < 0) return "Informe um preço válido, igual ou maior que zero.";
    return "";
}

function setFormFeedback(message, type = "") {
    const feedback = el("form-feedback");
    feedback.textContent = message;
    feedback.classList.toggle("error", type === "error");
}

function setEditMode(trip) {
    state.selectedTrip = trip;
    el("trip-id").value = trip.id;
    el("destino").value = trip.destino || "";
    el("dataIda").value = trip.dataIda || "";
    el("dataVolta").value = trip.dataVolta || "";
    el("preco").value = trip.preco ?? "";
    el("observacoes").value = trip.observacoes || "";
    el("form-title").textContent = "Editar viagem";
    el("submit-label").textContent = "Salvar alterações";
    el("edit-mode-row").hidden = false;
    el("cancel-edit").hidden = false;
    setFormFeedback(`Editando a viagem #${trip.id}.`);
    el("form-section").scrollIntoView({ behavior: "smooth", block: "start" });
    el("destino").focus({ preventScroll: true });
}

function beginEdit(trip) {
    setEditMode(trip);
}

function resetForm() {
    form.reset();
    state.selectedTrip = null;
    el("trip-id").value = "";
    el("form-title").textContent = "Adicionar viagem";
    el("submit-label").textContent = "Guardar viagem";
    el("edit-mode-row").hidden = true;
    el("cancel-edit").hidden = true;
    setFormFeedback("");
}

async function submitTrip(event) {
    event.preventDefault();
    const trip = readForm();
    const validationError = validateTrip(trip);
    if (validationError) {
        setFormFeedback(validationError, "error");
        showToast(validationError, "error");
        return;
    }

    const submitButton = el("submit-button");
    submitButton.disabled = true;
    try {
        let result;
        if (!state.selectedTrip) {
            result = await apiRequest(API, { method: "POST", body: JSON.stringify(trip) });
            resetForm();
            showToast(`Viagem cadastrada${result.data?.id ? ` com código #${result.data.id}` : ""}.`);
        } else if (el("update-mode").value === "destino") {
            const oldDestination = state.selectedTrip.destino;
            const url = `${API}/pesquisa?destino=${encodeURIComponent(oldDestination)}`;
            result = await apiRequest(url, { method: "PUT", body: JSON.stringify(trip) });
            resetForm();
            showToast("Viagem atualizada usando o destino exato.");
        } else {
            const url = `${API}?id=${encodeURIComponent(state.selectedTrip.id)}`;
            result = await apiRequest(url, { method: "PUT", body: JSON.stringify(trip) });
            resetForm();
            showToast(`Viagem #${result.data?.id ?? state.selectedTrip?.id ?? ""} atualizada.`);
        }
        setFormFeedback("Operação concluída com sucesso.");
        await refreshTrips();
    } catch (error) {
        setFormFeedback(error.message, "error");
        showToast(error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
}

async function deleteById(trip) {
    const confirmed = window.confirm(`Excluir a viagem “${trip.destino}” (ID ${trip.id})? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    try {
        await apiRequest(`${API}?id=${encodeURIComponent(trip.id)}`, { method: "DELETE" });
        if (state.selectedTrip?.id === trip.id) resetForm();
        showToast(`Viagem #${trip.id} excluída.`);
        await refreshTrips();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function deleteByExactDestination() {
    const destination = state.searchTerm.trim();
    if (!destination || state.searchMode !== "exact") return;
    const confirmed = window.confirm(`Excluir todas as viagens cujo destino seja exatamente “${destination}”? Viagens com esse mesmo destino também serão excluídas.`);
    if (!confirmed) return;
    try {
        await apiRequest(`${API}/pesquisa?destino=${encodeURIComponent(destination)}`, { method: "DELETE" });
        resetForm();
        showToast(`Solicitada exclusão das viagens com destino “${destination}”.`);
        await refreshTrips();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function showTripDetails(id) {
    try {
        const { data } = await apiRequest(`${API}/${encodeURIComponent(id)}`);
        const details = [
            `Viagem #${data.id} — ${data.destino}`,
            `Ida: ${formatDate(data.dataIda)}`,
            `Volta: ${formatDate(data.dataVolta)}`,
            `Preço: ${formatPrice(data.preco)}`,
            `Observações: ${data.observacoes || "nenhuma"}`
        ].join("\n");
        window.alert(details);
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function searchTrips(event) {
    event.preventDefault();
    state.searchTerm = el("search-destination").value.trim();
    state.searchMode = el("search-mode").value;
    await refreshTrips();
}

function clearSearch() {
    el("search-destination").value = "";
    state.searchTerm = "";
    state.searchMode = el("search-mode").value;
    refreshTrips();
}

function initializeDateAndEvents() {
    el("today-label").textContent = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date());
    form.addEventListener("submit", submitTrip);
    el("cancel-edit").addEventListener("click", resetForm);
    el("search-form").addEventListener("submit", searchTrips);
    el("clear-search").addEventListener("click", clearSearch);
    el("refresh-button").addEventListener("click", refreshTrips);
    el("delete-destination-button").addEventListener("click", deleteByExactDestination);
    el("empty-add-button").addEventListener("click", () => el("destino").focus());
    el("search-mode").addEventListener("change", () => {
        state.searchMode = el("search-mode").value;
        if (state.searchTerm) searchTrips(new Event("submit", { cancelable: true }));
    });
    refreshTrips();
}

document.addEventListener("DOMContentLoaded", initializeDateAndEvents);
