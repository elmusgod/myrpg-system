import { MyRPGActorSheet } from "./actor-sheet.js";
import { MyRPGActorDataModel } from "./actor-models.js";

Hooks.once("init", async function() {
  console.log("MyRPG | Initialisation du système");
  
  // Enregistrement du modèle de données
  CONFIG.Actor.dataModels.character = MyRPGActorDataModel;
  
  // Enregistrement de la feuille de personnage
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("myrpg", MyRPGActorSheet, { 
    types: ["character"],
    makeDefault: true,
    label: "MYRPG.SheetPJ"
  });

  // Configuration des attributs affichables sur le token
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["resources.hp", "resources.ee"],
      value: ["level"]
    }
  };
});

// Hook de debug pour voir les erreurs potentielles
Hooks.once("ready", () => {
  console.log("MyRPG | Système prêt");
});

// Hook pour le debug des fiches de personnage
Hooks.on("renderActorSheet", (app, html, data) => {
  console.log("MyRPG | Rendu de la feuille", {
    app: app,
    html: html,
    data: data
  });
});

// Hook pour attraper les erreurs
Hooks.on("error", (error) => {
  console.error("MyRPG | Erreur détectée:", error);
});
