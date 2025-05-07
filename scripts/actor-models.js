const { HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/* -------------------------------------------- */
/*  Table d'expérience                          */
/* -------------------------------------------- */

const XP_LEVELS = {
  1: 0,
  2: 100,
  3: 200,
  4: 300,
  5: 500,
  6: 700,
  7: 1000,
  8: 1300,
  9: 1600,
  10: 2000,
  11: 2500,
  12: 3000,
  13: 3500,
  14: 4000,
  15: 4500,
  16: 5000,
  17: 5500,
  18: 6000,
  19: 6500,
  20: 7000,
  21: 8000,
  22: 9000,
  23: 10000,
  24: 11000,
  25: 12000
};

/* -------------------------------------------- */
/*  Modèle de données de base                   */
/* -------------------------------------------- */

export class MyRPGActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Attributs de base
      attributes: new SchemaField({
        con: new NumberField({ 
          required: true, 
          integer: true, 
          initial: 1,
          min: 1,
          max: 10,
          label: "MYRPG.AttributeCon"
        }),
        int: new NumberField({ 
          required: true, 
          integer: true, 
          initial: 1,
          min: 1,
          max: 10,
          label: "MYRPG.AttributeInt"
        }),
        agi: new NumberField({ 
          required: true, 
          integer: true, 
          initial: 1,
          min: 1,
          max: 10,
          label: "MYRPG.AttributeAgi"
        })
      }),
      
      // Défenses calculées
      defenses: new SchemaField({
        fortitude: new SchemaField({
          value: new NumberField({ required: true, integer: true, initial: 0 }),
          source: new StringField({ required: true, initial: "CON" })
        }),
        evasion: new SchemaField({
          value: new NumberField({ required: true, integer: true, initial: 0 }),
          source: new StringField({ required: true, initial: "AGI" })
        })
      }),

      // Ressources
      resources: new SchemaField({
        hp: new SchemaField({
          value: new NumberField({ required: true, integer: true, initial: 10 }),
          max: new NumberField({ required: true, integer: true, initial: 10 })
        }),
        ee: new SchemaField({
          value: new NumberField({ required: true, integer: true, initial: 0 }),
          max: new NumberField({ required: true, integer: true, initial: 0 })
        })
      }),

      // Niveau et expérience
      level: new NumberField({ 
        required: true, 
        integer: true, 
        initial: 1,
        min: 1,
        max: 25
      }),
      xp: new SchemaField({
        value: new NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0
        }),
        next: new NumberField({
          required: true,
          integer: true,
          initial: 100
        })
      }),

      // Inventaire
      inventory: new SchemaField({
        capacity: new SchemaField({
          max: new NumberField({ 
            required: true, 
            integer: true, 
            initial: 0
          }),
          used: new NumberField({ 
            required: true, 
            integer: true, 
            initial: 0
          })
        })
      })
    };
  }

  prepareDerivedData() {
    const system = this;

    // Calcul des PV max (10 + Niveau + (CON × 2))
    system.resources.hp.max = 10 + system.level + (system.attributes.con * 2);

    // Calcul de l'ÉE max (somme des attributs)
    system.resources.ee.max = system.attributes.con + 
                            system.attributes.int + 
                            system.attributes.agi;

    // Calcul des défenses
    system.defenses.fortitude.value = system.attributes.con;
    system.defenses.evasion.value = system.attributes.agi;

    // Calcul de l'XP nécessaire pour le niveau suivant
    const currentLevel = system.level;
    if (currentLevel < 25) {
      system.xp.next = XP_LEVELS[currentLevel + 1];
    } else {
      system.xp.next = XP_LEVELS[25];
    }

    // Calcul de la capacité d'inventaire (CON × 10)
    system.inventory.capacity.max = system.attributes.con * 10;
  }
}
