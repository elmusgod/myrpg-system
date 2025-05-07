import { ActorSheet } from "foundry.js";

export class MyRPGActorSheet extends ActorSheet {
  /** Calcul et mise à jour des ressources */
  getData() {
    const data = super.getData().actor.data.data;
    const { str, con, int, agi } = data.attributes;
    // Recalculer EE
    data.resources.ee.max = str + con + int + agi;
    data.resources.ee.value = Math.min(data.resources.ee.value, data.resources.ee.max);
    // Recalculer PV
    data.resources.hp.max = 10 + data.level + con * 2;
    data.resources.hp.value = Math.min(data.resources.hp.value, data.resources.hp.max);
    return data;
  }

  /** Roll d'attaque mêlée ou distance */
  _rollAttack(event, { range = true, attribute = "str" } = {}) {
    const target = Array.from(game.user.targets)[0];
    if (!target) return ui.notifications.warn("Cible requise");
    const atk = this.actor.data.data.data.attributes[attribute];
    const defType = range ? "evasion" : "fortitude";
    const defense = target.actor.data.data.data.defenses[defType];
    const formula = `1d20 + ${atk} - ${defense}`;
    new Roll(formula).roll({ async: true }).then(r => r.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor })
    }));
  }

  /** Activation des écouteurs sur les boutons */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".roll-attack-mellee").click(ev => this._rollAttack(ev, { range:false, attribute:"str" }));
    html.find(".roll-attack-distance").click(ev => this._rollAttack(ev, { range:true, attribute:"agi" }));
  }
}
