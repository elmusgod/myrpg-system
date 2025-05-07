import { MyRPGActorSheet } from "./actor-sheet.js";
import { MyRPGActorDataModel } from "./actor-models.js";

Hooks.once("init", function() {
  console.log("MyRPG | Initialisation du système");
  
  // Enregistrement du modèle de données
  CONFIG.Actor.dataModels.character = MyRPGActorDataModel;
  
  // Enregistrement de la feuille de personnage
  Actors.registerSheet("myrpg", MyRPGActorSheet, { 
    types: ["character"],
    makeDefault: true
  });
});

Hooks.once("ready", function() {
  // Configuration des attributs affichables sur le token
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["resources.hp", "resources.ee"],
      value: ["level"]
    }
  };
});
