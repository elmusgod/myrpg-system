export class MyRPGActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["myrpg", "sheet", "actor"],
      template: "systems/myrpg/template/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  getData() {
    const context = super.getData();

    // Ajout des données calculées
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    
    // S'assurer que les valeurs ne dépassent pas les maximums
    context.system.resources.hp.value = Math.min(
      context.system.resources.hp.value,
      context.system.resources.hp.max
    );
    context.system.resources.ee.value = Math.min(
      context.system.resources.ee.value,
      context.system.resources.ee.max
    );

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Gestionnaires d'événements pour les boutons d'actions
    html.find('.roll-attack-mellee').click(this._onMeleeAttack.bind(this));
    html.find('.roll-attack-distance').click(this._onRangedAttack.bind(this));
  }

  async _onMeleeAttack(event) {
    const actor = this.actor;
    const target = game.user.targets.first()?.actor;
    
    if (!target) {
      ui.notifications.warn("Vous devez sélectionner une cible");
      return;
    }

    // Formule: 1d20 + CON - Fortitude de la cible
    const roll = await new Roll("1d20 + @con - @def", {
      con: actor.system.attributes.con,
      def: target.system.defenses.fortitude
    }).evaluate({async: true});

    // Message dans le chat
    const templateData = {
      actor: actor,
      target: target,
      roll: roll
    };

    const content = await renderTemplate(
      "systems/myrpg/template/chat/attack-roll.html",
      templateData
    );

    ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    });
  }

  async _onRangedAttack(event) {
    const actor = this.actor;
    const target = game.user.targets.first()?.actor;
    
    if (!target) {
      ui.notifications.warn("Vous devez sélectionner une cible");
      return;
    }

    // Formule: 1d20 + AGI - Evasion de la cible
    const roll = await new Roll("1d20 + @agi - @def", {
      agi: actor.system.attributes.agi,
      def: target.system.defenses.evasion
    }).evaluate({async: true});

    // Message dans le chat
    const templateData = {
      actor: actor,
      target: target,
      roll: roll
    };

    const content = await renderTemplate(
      "systems/myrpg/template/chat/attack-roll.html",
      templateData
    );

    ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      roll: roll,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    });
  }
}
