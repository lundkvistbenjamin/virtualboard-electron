// This is replaced when deploying
//const API_URL = "http://localhost:8080";
const API_URL = "https://virtualboard-backend.azurewebsites.net";


/* API calls */

// Skapa användare
export async function createUser(user, pass) {
    const response = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "name": user.toLowerCase(),
            "password": pass
        })
    });

    if (!response.ok) {
        console.error("Failed to create user!", response.status);
        return;
    }

    const respData = await response.json();
    return respData;
}

// Logga in
export async function logIn(user, pass) {
    const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "name": user.toLowerCase(),
            "password": pass
        })
    });

    if (!response.ok) {
        console.error("Failed to login!", response.status);
        return;
    }

    const respData = await response.json();
    return respData;
}

// Ta emot alla boards för en användare
export async function getBoards(jwtToken) {
    const response = await fetch(`${API_URL}/boards`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
        }
    });

    if (!response.ok) {
        console.error("Failed to fetch boards:", response.status);
        return;
    }

    const respData = await response.json();
    return respData;
}

// Ta emot alla notes för en specifik board
export async function getBoardNotes(boardId, jwtToken) {
    const response = await fetch(`${API_URL}/notes/${boardId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
        }
    });

    if (!response.ok) {
        console.error("Failed to fetch notes:", response.status);
        return;
    }

    const respData = await response.json();
    return respData;
}

// Skapa note
export async function createNote(boardId, jwtToken) {
    const response = await fetch(`${API_URL}/notes/${boardId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
            content: "",
            positionX: "100",
            positionY: "100",
            color: "orange"
        })
    });

    if (!response.ok) {
        console.error("Failed to create note:", response.status);
        return;
    }

    const respData = await response.json();
    return respData;
}

// Uppdatera note
export async function updateNote(boardId, jwtToken, noteId, updatedContent, updatedPositionX, updatedPositionY, updatedColor) {
    // Prepare the data to send in the request
    const updateData = {};

    // Sätter till values bara om dom finns
    if (updatedContent !== undefined) updateData.content = updatedContent;
    if (updatedPositionX !== undefined) updateData.positionX = updatedPositionX;
    if (updatedPositionY !== undefined) updateData.positionY = updatedPositionY;
    if (updatedColor !== undefined) updateData.color = updatedColor;

    // Make the fetch request to update the note
    const response = await fetch(`${API_URL}/notes/${boardId}/${noteId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        console.error("Failed to update note:", response.status);
        return;
    }

    const respData = await response.json();
    return respData;
}

// Ta bort note
export async function deleteNote(boardId, noteId, jwtToken) {
    const response = await fetch(`${API_URL}/notes/${boardId}/${noteId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
        }
    });

    if (!response.ok) {
        console.error('Failed to delete note:', response.status);
        return;
    }
    const respData = await response.json();
    return respData;
}

// Kolla om jwt-token i LocalStorage är giltig
export async function checkTokenValidity(jwtToken) {
    if (!jwtToken) {
        return false;
    }
    const response = await fetch(`${API_URL}/users/verify-token`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${jwtToken}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        return true;
    } else {
        console.error("Invalid token!");
        return false;
    }
}
