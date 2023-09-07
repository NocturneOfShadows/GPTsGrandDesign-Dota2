# Dota 2: GPT's Grand Design

Welcome to "Dota 2: GPT's Grand Design" - a unique custom game experience where every hero is reimagined by ChatGPT, OpenAI's advanced language model. Dive into a world where familiar heroes take on new identities, abilities, and playstyles, all while adhering to a comprehensive design philosophy that ensures balance and fun.

## Overview

This custom game aims to provide a fresh perspective on Dota 2's iconic heroes. With the power of AI, each hero is redesigned from the ground up, offering players a chance to explore new strategies, combos, and gameplay dynamics.

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
