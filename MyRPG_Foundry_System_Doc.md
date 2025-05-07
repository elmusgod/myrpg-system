# MyRPG System pour Foundry VTT

Ce document rassemble :
1. La structure du dossier et des fichiers du module Foundry VTT  
2. Les fichiers de configuration `module.json` et `system.json`  
3. Les extraits de code JavaScript/HTML pour la feuille d’acteur  
4. L’exemple JSON des races  
5. Les règles complètes du système  

---

## 1. Structure du module

```
myrpg-system/
├─ module.json           ← manifeste principal
├─ system.json           ← déclare les entités et feuilles
├─ template/
│  ├─ actor-sheet.html   ← modèle Handlebars de la feuille d’acteur
│  └─ actor-sheet.css    ← styles CSS de la feuille
├─ scripts/
│  ├─ main.js            ← chargement du système
│  └─ actor-sheet.js     ← logique de la feuille d’acteur
├─ lang/
│  └─ en.json            ← traductions (facultatif)
└─ README.md             ← ce document
```

---

## 2. `module.json`

```json
{
  "name": "myrpg-system",
  "title": "MyRPG System",
  "description": "Un système médiéval-fantastique à 3 attributs, sans classes ni sorts prédéfinis.",
  "version": "0.1.0",
  "author": "Vous",
  "minimumCoreVersion": "0.8.0",
  "compatibleCoreVersion": "9",
  "systems": ["myrpg"],
  "packs": [],
  "esmodules": ["scripts/main.js"],
  "styles": ["template/actor-sheet.css"]
}
```

---

## 3. `system.json`

```json
{
  "id": "myrpg",
  "name": "MyRPG",
  "version": "0.1.0",
  "template": "template/actor-sheet.html",
  "entityTypes": ["Actor", "Item"],
  "actors": [
    {
      "name": "Default Actor",
      "type": "character",
      "img": "icons/svg/mystery-man.svg",
      "sheet": "scripts/actor-sheet.js"
    }
  ],
  "items": [
    {
      "name": "Default Item",
      "type": "ability",
      "img": "icons/svg/book.svg",
      "data": {}
    }
  ]
}
```

---

## 4. `scripts/actor-sheet.js`

```js
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

  /** Roll d’attaque mêlée ou distance */
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
```

---

## 5. `template/actor-sheet.html`

```html
<form>
  <section>
    <h2>Attributs</h2>
    {{#each data.attributes as |val att|}}
      <div>{{att}} : {{val}}</div>
    {{/each}}
  </section>
  <section>
    <h2>Défenses</h2>
    <div>Fortitude : {{data.defenses.fortitude}}</div>
    <div>Evasion   : {{data.defenses.evasion}}</div>
  </section>
  <section>
    <h2>Ressources</h2>
    <div>ÉE : {{data.resources.ee.value}} / {{data.resources.ee.max}}</div>
    <div>PV : {{data.resources.hp.value}} / {{data.resources.hp.max}}</div>
  </section>
  <section class="actions">
    <button type="button" class="roll-attack-mellee">Attaque Mêlée</button>
    <button type="button" class="roll-attack-distance">Attaque Distance</button>
  </section>
</form>
```

---

## 6. Exemple JSON d’une race (`compendium`)

```json
{
  "name": "Orc",
  "type": "race",
  "img": "icons/svg/orc.svg",
  "data": {
    "bonuses": { "con": 2 },
    "traits": ["Immunité au poison"],
    "features": [
      "Illusion mineure (jet d’Int, 1×/repos long)",
      "Manipulation mentale (jet d’Int, 1×/repos long)"
    ]
  }
}
```

---

## 7. Règles complètes

### 7.1 Caractéristiques  
- **3 attributs** :  
  - **Constitution (CON)** : PV, résistances (météo, poison), mêlée  
  - **Intelligence (INT)** : sorts, persuasion, énigmes  
  - **Agilité (AGI)** : distance, artisanat, esquive  

- **Scores** : 1 à 10, chaque point = +1 au jet  
- **Total d’attributs max** : 30  
- **Difficultés de jet** : min 5, max 25  

### 7.2 Races  
| Race   | Bonus                            | Traits spéciaux                                       |
|--------|----------------------------------|-------------------------------------------------------|
| Humain | +1 à l’attribut de votre choix   | —                                                     |
| Elfe   | Vision nocturne                  | —                                                     |
| Nain   | +2 à l’Agilité (discrétion, vol, fouille) | Petite taille                                   |
| Orc    | Immunité au poison               | 1×/repos long : illusions mineures, manipulation mentale |

### 7.3 Jets d’action  
```
Résultat = 1d20 + Attribut_Pos - Déf_Cible - Armure_Cible
```  
- **Distance** : Attribut_Pos = AGI, Déf_Cible = AGI  
- **Contact**  : Attribut_Pos = CON, Déf_Cible = CON  

### 7.4 Énergie d’Élan (ÉE)  
- **Pool** : CON + INT + AGI (max 30)  
- **Coût de base** : difficulté de l’action  
- **Réduction** : chaque tranche de 3 points au-delà réduit le coût de 1 ÉE (arrondi ↓)

### 7.5 Points de Vie (PV)  
```
PV_max = 10 + Niveau + (CON × 2)
```  
- **Niveau max** : 25 (PV_max hors équipement : 55)  

### 7.6 Blessure critique  
- **Seuil** : dégâts ≥ 90 % PV_max → handicap narratif

### 7.7 Progression & XP  
- **+1 point d’attribut** par niveau  
- **Table XP** (rapide 1–10, lente 10–20, très lente 20–25)  
| Niveau | XP cumulées | XP palier |
|:------:|:-----------:|:---------:|
| 1      | 0           | —         |
| …      | …           | …         |
| 10     | 900         | 100       |
| 11     | 1 100       | 200       |
| …      | …           | …         |
| 20     | 2 900       | 200       |
| 21     | 3 300       | 400       |
| 25     | 4 900       | 400       |

### 7.8 Inventaire  
- **Capacité** : CON × 10 unités  
- Augmente avec la Constitution

### 7.9 Évolution par usage  
- Compteurs d’utilisation sur chaque effet  
- Palier d’évolution au nombre de usages  
- Combinaisons débloquant de nouveaux effets

*Fin du document. Prêt pour l’IA de codage !*
