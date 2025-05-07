import { MyRPGActorSheet } from "./actor-sheet.js";

Hooks.once("init", function() {
  console.log("MyRPG | Initialisation du système");
  
  // Enregistrement de la feuille de personnage
  Actors.registerSheet("myrpg", MyRPGActorSheet, { 
    types: ["character"],
    makeDefault: true
  });

  // Configuration du modèle de données par défaut pour les personnages
  CONFIG.Actor.dataModels.character = {
    attributes: {
      str: { type: Number, initial: 1, min: 1, max: 10 },
      con: { type: Number, initial: 1, min: 1, max: 10 },
      int: { type: Number, initial: 1, min: 1, max: 10 },
      agi: { type: Number, initial: 1, min: 1, max: 10 }
    },
    defenses: {
      fortitude: { type: Number, initial: 0 },
      evasion: { type: Number, initial: 0 }
    },
    resources: {
      ee: { 
        value: { type: Number, initial: 0 },
        max: { type: Number, initial: 0 }
      },
      hp: {
        value: { type: Number, initial: 10 },
        max: { type: Number, initial: 10 }
      }
    },
    level: { type: Number, initial: 1, min: 1, max: 25 }
  };
});
