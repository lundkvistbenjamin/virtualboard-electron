interact(".note")
    .draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: "parent",
                endOnly: true
            })
        ],
        autoScroll: true,

        listeners: {
            move: dragMoveListener,

            end(event) {
                // Hämta de slutgiltiga koordinaterna
                const droppedX = event.target.getAttribute("data-x");
                const droppedY = event.target.getAttribute("data-y");
                const noteId = event.target.id;

                // Skapa och skicka ett anpassat event med koordinaterna
                const moveEvent = new CustomEvent("noteMoved", {
                    detail: {
                        noteId: noteId,
                        x: droppedX,
                        y: droppedY
                    }
                });

                // Skicka eventet
                window.dispatchEvent(moveEvent);
            }
        }
    });

function dragMoveListener(event) {
    const target = event.target;

    // Behåll den dragna positionen i data-x/data-y attributen
    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // Översätt elementet
    target.style.transform = "translate(" + x + "px, " + y + "px)";

    // Uppdatera positionsattributen
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
}
