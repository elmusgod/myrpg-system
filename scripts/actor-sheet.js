export class MyRPGActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["myrpg", "sheet", "actor"],
      template: "systems/myrpg/template/actor/character-sheet.html",
      width: 600,
      height: 680,
      tabs: [{ 
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "stats"
      }]
    });
  }

  getData() {
    const context = super.getData();
    const actorData = this.actor;

    // Préparer les données du personnage
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Ajouter des informations dérivées pour l'affichage
    this._prepareCharacterData(context);

    return context;
  }

  _prepareCharacterData(context) {
    // Formater les attributs pour l'affichage
    for (let [key, attribute] of Object.entries(context.system.attributes)) {
      if (typeof attribute === 'number') {
        const mod = attribute - 5;
        context.system.attributes[key] = {
          value: attribute,
          mod: mod,
          label: game.i18n.localize(`MYRPG.Attribute${key.charAt(0).toUpperCase() + key.slice(1)}`)
        };
      }
    }

    // Formater les défenses
    for (let [key, defense] of Object.entries(context.system.defenses)) {
      if (defense.value !== undefined) {
        context.system.defenses[key] = {
          value: defense.value,
          source: defense.source,
          label: game.i18n.localize(`MYRPG.Defense${key.charAt(0).toUpperCase() + key.slice(1)}`)
        };
      }
    }

    // Préparer les informations d'XP
    if (context.system.xp) {
      const xpData = context.system.xp;
      const currentXP = xpData.value || 0;
      const nextLevelXP = xpData.next;
      const level = context.system.level;

      context.system.xp = {
        value: currentXP,
        min: 0,
        max: nextLevelXP,
        pct: Math.min(Math.round((currentXP * 100) / nextLevelXP), 100)
      };
    }

    // Formater l'inventaire
    if (context.system.inventory?.capacity) {
      const inventory = context.system.inventory.capacity;
      context.system.inventory = {
        max: inventory.max,
        used: inventory.used,
        pct: Math.min(Math.round((inventory.used * 100) / inventory.max), 100)
      };
    }
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Actions de combat
    html.find('.roll-attack-mellee').click(this._onMeleeAttack.bind(this));
    html.find('.roll-attack-distance').click(this._onRangedAttack.bind(this));

    // Modification des attributs
    html.find('.attribute input').change(this._onAttributeChange.bind(this));
  }

  async _onMeleeAttack(event) {
    const actor = this.actor;
    const target = game.user.targets.first()?.actor;
    
    if (!target) {
      ui.notifications.warn(game.i18n.localize("MYRPG.WarningNoTarget"));
      return;
    }

    const roll = await new Roll("1d20 + @con - @def", {
      con: actor.system.attributes.con.value,
      def: target.system.defenses.fortitude.value
    }).evaluate({async: true});

    const templateData = {
      actor: actor,
      target: target,
      roll: roll,
      attackType: game.i18n.localize("MYRPG.AttackMelee")
    };

    const content = await renderTemplate(
      "systems/myrpg/template/chat/attack-roll.html",
      templateData
    );

    ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: CONFIG.sounds.dice
    });
  }

  async _onRangedAttack(event) {
    const actor = this.actor;
    const target = game.user.targets.first()?.actor;
    
    if (!target) {
      ui.notifications.warn(game.i18n.localize("MYRPG.WarningNoTarget"));
      return;
    }

    const roll = await new Roll("1d20 + @agi - @def", {
      agi: actor.system.attributes.agi.value,
      def: target.system.defenses.evasion.value
    }).evaluate({async: true});

    const templateData = {
      actor: actor,
      target: target,
      roll: roll,
      attackType: game.i18n.localize("MYRPG.AttackRanged")
    };

    const content = await renderTemplate(
      "systems/myrpg/template/chat/attack-roll.html",
      templateData
    );

    ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: CONFIG.sounds.dice
    });
  }

  _onAttributeChange(event) {
    const input = event.currentTarget;
    const value = Math.clamped(parseInt(input.value), 1, 10);
    const attributeName = input.name.split('.').pop();

    this.actor.update({
      [`system.attributes.${attributeName}`]: value
    });
  }
}
