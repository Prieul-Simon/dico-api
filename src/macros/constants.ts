import figlet from "figlet";

const API_NAME = figlet.textSync("SCRABBLE DICO API", {
    font: "Standard",
})

export const apiName: () => string = () => API_NAME