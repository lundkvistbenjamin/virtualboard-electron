const loginContainer = document.querySelector(".login-container");
const logoutContainer = document.querySelector(".logout-container");
const boardContainer = document.querySelector(".board-container");
const notesContainer = document.querySelector(".notes-container");
const notesCenter = document.querySelector(".notes-center");
const boardsDropdown = document.querySelector("#board-dropdown");

import { getBoards } from "./api.js";

/* UI functions */

// Visa logged in vy
export const showLoggedIn = () => {
    loginContainer.style.display = "none";
    logoutContainer.style.display = "block";
    boardContainer.style.display = "flex";
    notesCenter.style.display = "flex";
    displayBoardDropdown();
};

// Visa logged out vy
export const showLoggedOut = () => {
    loginContainer.style.display = "flex";
    logoutContainer.style.display = "none";
    boardContainer.style.display = "none";
    notesCenter.style.display = "none";
};

// Visa board dropdown
export const displayBoardDropdown = async () => {
    const jwtToken = localStorage.getItem("jwtToken");
    const boards = await getBoards(jwtToken);

    boardsDropdown.innerHTML = '<option value="" disabled selected>Välj en tavla</option>';
    for (let i = 0; i < boards.length; i++) {
        const option = document.createElement("option");
        option.value = boards[i].id;
        option.textContent = boards[i].title;
        boardsDropdown.appendChild(option);
    }
};

// Visa en note
// Matade in html vi själv skapat för en note i chatGPT och fick innehållet av denna funktion
export const displayNote = (note) => {
    const noteDiv = document.createElement("div");
    noteDiv.id = note.id;
    noteDiv.className = `note ${note.color || ''}`;
    noteDiv.style.transform = `translate(${note.positionX || 0}px, ${note.positionY || 0}px)`;
    noteDiv.style.cursor = "move";
    noteDiv.setAttribute("data-x", note.positionX || 0);
    noteDiv.setAttribute("data-y", note.positionY || 0);
    const noteBtnContainer = document.createElement("div");
    noteBtnContainer.className = "note-btn-container";
    const buttonGroup = document.createElement("div");
    const orangeButton = document.createElement("button");
    orangeButton.className = "note-btn orange-note-btn";
    const greenButton = document.createElement("button");
    greenButton.className = "note-btn green-note-btn";
    buttonGroup.appendChild(orangeButton);
    buttonGroup.appendChild(greenButton);
    const deleteButton = document.createElement("button");
    deleteButton.className = "note-btn delete-note-btn";
    noteBtnContainer.appendChild(buttonGroup);
    noteBtnContainer.appendChild(deleteButton);
    const noteTextarea = document.createElement("textarea");
    noteTextarea.id = `note-${note.id}-content`;
    noteTextarea.name = "note-content";
    noteTextarea.className = "note-input";
    noteTextarea.placeholder = "Skriv note här...";
    noteTextarea.autocomplete = "off";
    noteTextarea.value = note.content || '';
    noteDiv.appendChild(noteBtnContainer);
    noteDiv.appendChild(noteTextarea);

    notesContainer.appendChild(noteDiv);
};


// Visa alla notes
export const displayAllNotes = (notes) => {
    notesContainer.innerHTML = "";
    notes.forEach(note => {
        displayNote(note);
    });
};

// Ta bort note från skärmen
export const deleteNoteFromUI = (noteId) => {
    const noteElement = document.getElementById(noteId);
    if (noteElement) {
        noteElement.remove();
    }
};
