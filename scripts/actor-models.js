const { NumberField, SchemaField } = foundry.data.fields;

/* -------------------------------------------- */
/*  Base Actor Data Model                       */
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
          max: 10
        }),
        int: new NumberField({ 
          required: true, 
          integer: true, 
          initial: 1,
          min: 1,
          max: 10
        }),
        agi: new NumberField({ 
          required: true, 
          integer: true, 
          initial: 1,
          min: 1,
          max: 10
        })
      }),
      
      // Défenses calculées
      defenses: new SchemaField({
        fortitude: new NumberField({ 
          required: true, 
          integer: true, 
          initial: 0
        }),
        evasion: new NumberField({ 
          required: true, 
          integer: true, 
          initial: 0
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
      xp: new NumberField({
        required: true,
        integer: true,
        initial: 0,
        min: 0
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
    system.defenses.fortitude = system.attributes.con;
    system.defenses.evasion = system.attributes.agi;
  }
}

// Configuration des attributs affichables sur le token
CONFIG.Actor.trackableAttributes = {
  character: {
    bar: ["resources.hp", "resources.ee"],
    value: ["level"]
  }
};
