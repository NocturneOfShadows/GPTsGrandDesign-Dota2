# Dota 2: GPT's Grand Design

Welcome to "Dota 2: GPT's Grand Design" - a unique custom game experience where every hero is reimagined by ChatGPT, OpenAI's advanced language model. Dive into a world where familiar heroes take on new identities, abilities, and playstyles, all while adhering to a comprehensive design philosophy that ensures balance and fun.

## Overview

This custom game aims to provide a fresh perspective on Dota 2's iconic heroes. With the power of AI, each hero is redesigned from the ground up, offering players a chance to explore new strategies, combos, and gameplay dynamics.

## Generating Abilities
- For consistency, all generated content comes from feeding ChatGPT 4 with the following prompt:
```
# Design Philosophy for Dota 2 Hero Redesigns:

1. **Versatility Over Specialization**: Heroes should adapt to various situations, not limited to one role or strategy.
2. **Counterplay is Key**: Every ability should have potential counterplay or weaknesses.
3. **Complexity in Moderation**: Abilities should offer depth without being overly complex.
4. **Consistent Power Curves**: Heroes should progress in power throughout the game.
5. **Unique Identity**: Each hero should have a distinct playstyle or mechanic, not derivative of their existing abilities or any other hero's abilities in Dota 2.
6. **Balanced Risk and Reward**: Powerful abilities should have risks or costs, which can be in the form of mana or health.
7. **Cohesive Theme**: Abilities and lore should be thematically consistent.

Given this philosophy, the goal is to craft heroes that are strategically deep and exhilarating. The redesigns aim for a fun meter rating of 10/10, ensuring engagement, satisfaction, and replayability.

## Hero: [HERO NAME]

### Lore: 
[Insert the hero's lore here for context and thematic direction.]

### Special Instructions:
[Insert any specific requirements or deviations from the standard format, like additional abilities, unique mechanics, or specific thematic elements. Use "None" as an input when there are no special instructions, for clarity and to ensure consistent results]

### Redesign Details:

1. **Primary Attribute and Base Stats**:
   - Base Strength, Agility, and Intelligence.
   - Growth rates for each attribute.
   - Base Damage range.
   - Starting Armor value.
   - Movement Speed.

2. **Abilities**:
   - Distinct name and engaging description.
   - Specify if Passive, Active, Toggle, or Channeled.
   - Essential details like damage type, cast range, **cast point (always mention, even if it's 0)**, and cost (can be mana or health).
   - **For channeled abilities, specify the channel duration.**
   - If values change across levels, provide the variable followed by values.
   - Cooldown and other mechanics.
   - *Note**: Abilities should be entirely new concepts, not derivatives or reminiscent of [HERO NAME]'s original abilities or any existing Dota 2 abilities.


3. **Aghanim's Shard and Scepter Upgrades**:
   - Effects of the Shard and Scepter. Sometimes, the Scepter might grant a completely new ability or enhance an existing one.

4. **Talent Tree**:
   - Talents for Levels 10, 15, 20, and 25.
   - Two options for each level, with at least 80% of the talents being unique upgrades to the hero's abilities. Talents should not upgrade effects or abilities granted by Aghanim's Scepter or Shard.

Ensure abilities, talents, and upgrades are unique and not reminiscent of existing Dota 2 abilities or the original kit. They should be balanced and fit within Dota 2's patterns, complementing the overall balance and fun factor of the entire hero pool and reflecting the hero's lore and thematic essence.
```


## Contents:

* **[src/common]:** TypeScript .d.ts type declaration files with shared types between Panorama and VScripts.
* **[src/vscripts]:** TypeScript code for Dota addon (Lua) vscripts. Outputs lua to game/scripts/vscripts.
* **[src/panorama]:** TypeScript code for panorama UI. Outputs js to content/panorama/scripts/custom_game.

--

* **[game/*]:** Dota game directory with files like npc kv files and compiled lua scripts.
* **[content/*]:** Dota content directory with panorama sources excluding scripts (xml, css, compiled js).

--

* **[scripts/*]:** Repository installation scripts.

## Continuous Integration

This project utilizes [GitHub Actions](https://github.com/features/actions) with a predefined [workflow](.github/workflows/ci.yml) that builds the custom game on every commit. It flags commits with type errors, ensuring code quality.
