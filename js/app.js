import { createUser, logIn, getBoardNotes, createNote, updateNote, deleteNote, checkTokenValidity } from "./api.js";
import { showLoggedIn, showLoggedOut, displayNote, displayAllNotes, deleteNoteFromUI } from "./UI.js";

// This is replaced when deploying
//const WS_URL = "ws://localhost:5000";
const WS_URL = "wss:/virtualboard-websocket.azurewebsites.net";

const loginMessage = document.querySelector(".login-message");

let jwtToken = localStorage.getItem("jwtToken");


/* WebSocket */

let currentSocket = null;
let currentBoardId;

const connectWebsocket = (boardId, jwtToken) => {

    if (!jwtToken || !boardId) {
        console.error("No JWT or boardId found");
        return;
    }
    if (currentSocket) {
        currentSocket.close();
    }

    currentBoardId = boardId;

    // Skapa websocket connection
    const socket = new WebSocket(`${WS_URL}?boardId=${boardId}&jwtToken=${jwtToken}`);
    currentSocket = socket;

    socket.onopen = async function (event) {
        console.log("Connected to WebSocket server");
        const notes = await getBoardNotes(boardId, jwtToken);
        if (notes) {
            displayAllNotes(notes);
        }
    };

    // Onmessage tar emot från servern
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const messageType = data.type;
        const note = data.note;

        // Hanterar olika message types
        if (messageType === "create") {
            displayNote(note);
        } else if (messageType === "update") {
            deleteNoteFromUI(note.id);
            displayNote(note);
        } else if (messageType === "delete") {
            deleteNoteFromUI(note.id);
        }
    };

    // Stäng socket
    socket.onclose = function (event) {
        console.log("Connection closed");
    };
};

/* Handlers. Är responsibla för ändringar i lokala skärmen och genom websocket. */

// Skapa användare
const handleCreateUser = async () => {
    const user = document.querySelector("#username").value;
    const pass = document.querySelector("#password").value;

    if (!user || user.length < 3) {
        alert("Användarnamn måste vara minst 3 tecken.");
        return;
    }
    if (!pass || pass.length < 5) {
        alert("Lösenord måste vara minst 5 tecken.");
        return;
    }

    try {
        const response = await createUser(user, pass);

        if (response) {
            loginMessage.innerText = "Användare skapad.";
        } else {
            loginMessage.innerText = "Användaren kunde inte skapas. Försök igen.";
        }
    } catch (error) {
        loginMessage.innerText = "Något gick fel. Försök igen.";
        console.error("Error:", error);
    }
};

// Logga in
const handleLogin = async () => {
    const user = document.querySelector("#username").value;
    const pass = document.querySelector("#password").value;

    try {
        const response = await logIn(user, pass);
        if (response) {
            jwtToken = response.jwt;
            localStorage.setItem("jwtToken", jwtToken);
            showLoggedIn();
        } else {
            loginMessage.innerText = "Inloggning misslyckades. Försök igen.";
        }
    } catch (error) {
        loginMessage.innerText = "Något gick fel. Försök igen.";
        console.error("Error:", error);
    }
};

// Skapa note
const handleCreateNote = async () => {
    try {
        const response = await createNote(currentBoardId, jwtToken);
        displayNote(response.note);

        currentSocket.send(JSON.stringify({
            status: 0,
            type: "create",
            note: response.note
        }));
    } catch (error) {
        console.error("Error:", error);
    }
};

//Radera note
const handleDeleteNote = async (event) => {
    if (event.target.classList.contains("delete-note-btn")) {
        const noteId = event.target.closest(".note").id;

        try {
            const response = await deleteNote(currentBoardId, noteId, jwtToken);
            if (response) {
                deleteNoteFromUI(noteId);

                currentSocket.send(JSON.stringify({
                    status: 0,
                    type: "delete",
                    note: { id: noteId }
                }));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
};

// Skriv i note
const handleNoteInput = async (event) => {
    if (event.target.classList.contains("note-input")) {
        const noteId = event.target.closest(".note").id;
        let updatedContent = event.target.value;

        try {
            const response = await updateNote(currentBoardId, jwtToken, noteId, updatedContent, undefined, undefined, undefined);
            if (response) {
                currentSocket.send(JSON.stringify({
                    status: 0,
                    type: "update",
                    note: response.note
                }));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
};

// Ändra färg i note
const handleNoteColorChange = async (event) => {
    if (event.target.classList.contains("orange-note-btn") || event.target.classList.contains("green-note-btn")) {
        const noteElement = event.target.closest(".note");
        const noteId = noteElement.id;
        const newColor = event.target.classList.contains("orange-note-btn") ? "orange" : "green";

        try {
            const response = await updateNote(currentBoardId, jwtToken, noteId, undefined, undefined, undefined, newColor);
            if (response) {
                noteElement.classList.remove("orange", "green");
                noteElement.classList.add(newColor);

                currentSocket.send(JSON.stringify({
                    status: 0,
                    type: "update",
                    note: response.note
                }));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
};

//Flytta på note
const handleNoteMoved = async (event) => {
    const { noteId, x, y } = event.detail;

    try {
        const response = await updateNote(currentBoardId, jwtToken, noteId, undefined, x, y, undefined);
        if (response) {
            currentSocket.send(JSON.stringify({
                status: 0,
                type: "update",
                note: response.note
            }));
        }
    } catch (error) {
        console.error("Error:", error);
    }
};


/* Event listeners */

document.querySelector("#btn-create-user").addEventListener("click", handleCreateUser);
document.querySelector("#btn-login").addEventListener("click", handleLogin);
document.querySelector("#btn-create-note").addEventListener("click", handleCreateNote);
document.querySelector(".notes-container").addEventListener("click", handleDeleteNote);
document.querySelector(".notes-container").addEventListener("input", handleNoteInput);
document.querySelector(".notes-container").addEventListener("click", handleNoteColorChange);
window.addEventListener("noteMoved", handleNoteMoved);

document.querySelector("#btn-logout").addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    location.reload();
});

document.querySelector("#board-dropdown").addEventListener("change", (event) => {
    let boardId = event.target.value;
    connectWebsocket(boardId, jwtToken);
});


/* On load */

// Kolla om JWT är giltig varje gång sidan refreshar
window.onload = async () => {
    const isValid = await checkTokenValidity(jwtToken);
    if (isValid) {
        showLoggedIn();
    } else {
        localStorage.removeItem("jwtToken");
        showLoggedOut();
    }
};
