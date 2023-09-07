// @ts-nocheck
"use strict";
function Init() {
    let control_panel = $('#MainPanel');
    if (!Game.IsInToolsMode()) {
        control_panel.style.visibility = "collapse";
        return;
    }
    var contextPanel = $.GetContextPanel();
    var parent = contextPanel.GetParent();
    var customRoot = parent.GetParent();
    var hudRoot = customRoot.GetParent().FindChild('HUDElements');
    var menuButtons = hudRoot.FindChild('MenuButtons');
    menuButtons.AddClass("HeroDemo");
    $.RegisterEventHandler('DOTAUIHeroPickerHeroSelected', $('#SelectHeroContainer'), SwitchToNewHero);
    var UiDefaults = CustomNetTables.GetTableValue("demo_table", "ui_defaults");
    if (UiDefaults) {
        $('#FreeSpellsButton').SetSelected(UiDefaults["WTFEnabled"]);
        $('#SpawnCreepsButton').SetSelected(UiDefaults["SpawnCreepsEnabled"]);
        $('#TowersEnabledButton').SetSelected(UiDefaults["TowersEnabled"]);
    }
    $.DispatchEvent('FireCustomGameEvent_Str', 'RequestInitialSpawnHeroID', null);
}
Init();
var bHeroPickerVisible = false;
function ToggleHeroPicker(bMainHero) {
    Game.EmitSound("UI.Button.Pressed");
    $('#SelectHeroContainer').SetHasClass('PickMainHero', bMainHero);
    //FixHeroPanels("#SelectHeroContainer");
    SetHeroPickerVisible(!bHeroPickerVisible);
}
function EscapeHeroPickerSearch() {
    //if ( $( "#SelectHeroContainer" ).FindChildTraverse( "HeroSearchTextEntry" ).BHasKeyFocus() )
    //{
    //	$( "#SelectHeroContainer" ).SetFocus();
    //}
    //else
    //{
    SetHeroPickerVisible(false);
    //}
}
function CloseHeroPicker() {
    SetHeroPickerVisible(false);
}
function SetHeroPickerVisible(bVisible) {
    if (bHeroPickerVisible) {
        if (!bVisible) {
            $('#SelectHeroContainer').RemoveClass('HeroPickerVisible');
            $("#SelectHeroContainer").FindChildTraverse("HeroSearchTextEntry").text = "";
        }
    }
    else {
        if (bVisible) {
            $('#SelectHeroContainer').AddClass('HeroPickerVisible');
            $("#SelectHeroContainer").FindChildTraverse("HeroSearchTextEntry").SetFocus();
        }
    }
    bHeroPickerVisible = bVisible;
}
function SwitchToNewHero(nHeroID) {
    Game.EmitSound("UI.Button.Pressed");
    //$.Msg( 'Hero = ' + nHeroID );
    if ($('#SelectHeroContainer').BHasClass('PickMainHero')) {
        $.DispatchEvent('FireCustomGameEvent_Str', 'SelectMainHeroButtonPressed', String(nHeroID));
    }
    else {
        $.DispatchEvent('FireCustomGameEvent_Str', 'SelectSpawnHeroButtonPressed', String(nHeroID));
    }
    $('#SelectHeroContainer').RemoveClass('PickMainHero');
    SetHeroPickerVisible(false);
}
function OnSetPlayerHeroID(event_data) {
    //$.Msg( "OnSetPlayerHeroID: ", event_data );
    var HeroDemoButton = $('#HeroDemoHeroName');
    if (HeroDemoButton != null) {
        var heroName = Players.GetPlayerSelectedHero(0);
        $.Msg( 'HERO NAME = ' + heroName );
        HeroDemoButton.SetDialogVariable("hero_name", $.Localize('#' + heroName));
        $('#Header').GetChild(1).heroname = heroName;
    }
}
GameEvents.Subscribe("set_player_hero_id", OnSetPlayerHeroID);
function OnSetMainHeroID(event_data) {
    //$.Msg( "OnSetMainHeroID: ", event_data );
    $.DispatchEvent("DOTADemoHeroEquippedItems", event_data.hero_name);
}
GameEvents.Subscribe("set_main_hero_id", OnSetMainHeroID);
function OnSwapMainHero(event_data) {
    $.Msg( "OnSetMainHeroID: ", event_data );
    $('#HeroDemoHeroName').SetDialogVariable("hero_name", $.Localize('#' + event_data.hero_name));
    $('#Header').GetChild(1).heroname = event_data.hero_name;
}
GameEvents.Subscribe("set_new_swapped_hero", OnSwapMainHero);
OnSwapMainHero({ hero_name: Players.GetPlayerSelectedHero(Game.GetLocalPlayerID()) });
function OnSetSpawnHeroID(event_data) {
    //$.Msg( "OnSetSpawnHeroID: ", event_data );
    var HeroPickerImage = $('#HeroPickerImage');
    if (HeroPickerImage != null) {
        //HeroPickerImage.heroid = event_data.hero_id;
        HeroPickerImage.SetImage('file://{images}/custom_game/heroes/topbar/' + event_data.hero_name + '.png');
    }
    var SpawnHeroButton = $('#SpawnHeroButton');
    if (SpawnHeroButton != null) {
        //$.Msg( 'HERO NAME = ' + event_data.hero_name );
        SpawnHeroButton.SetDialogVariable("hero_name", $.Localize('#' + event_data.hero_name));
        SpawnHeroButton.GetChild(0).heroname = event_data.hero_name;
    }
}
GameEvents.Subscribe("set_spawn_hero_id", OnSetSpawnHeroID);
function ToggleCategoryVisibility(str) {
    //$.Msg( "^^^ToggleCategoryVisibility() - " + str )
    $(str).ToggleClass('CollapseCategory');
}
function OnAddNewHeroEntry(event_data) {
    //$.Msg( "OnAddNewHeroEntry: ", event_data );
    // disabling experiment to add the spawned hero to your selection set
    //GameUI.SelectUnit( event_data.entindex, true );
}
GameEvents.Subscribe("add_new_hero_entry", OnAddNewHeroEntry);
function RemoveSelectedHeroes() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    var bDeletionAttempted = false;
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        var PlayerOwnerID = Entities.GetPlayerOwnerID(entindex);
        var bIsRealHero = Entities.IsRealHero(entindex);
        if (PlayerOwnerID == 0 && bIsRealHero) {
            //$.Msg( 'Skipping ent! ' + entindex );
            continue; // don't delete the player!
        }
        bDeletionAttempted = true;
        $.DispatchEvent('FireCustomGameEvent_Str', 'RemoveHeroButtonPressed', String(entindex));
    }
    if (bDeletionAttempted) {
        Game.EmitSound("UI.Button.Pressed");
    }
    else {
        Game.EmitSound("General.Cancel");
    }
}
function ToggleInvulnerability() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'ToggleInvulnerabilityHero', String(entindex));
    }
}
function InvulnerableOn() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'InvulnOnHero', String(entindex));
    }
    if (numEntities > 0) {
        Game.EmitSound("UI.Button.Pressed");
    }
}
function InvulnerableOff() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'InvulnOffHero', String(entindex));
    }
    if (numEntities > 0) {
        Game.EmitSound("UI.Button.Pressed");
    }
}
function LevelUpSelectedHeroes() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'LevelUpHero', String(entindex));
    }
    if (numEntities > 0) {
        Game.EmitSound("UI.Button.Pressed");
    }
}
function MaxLevelUpSelectedHeroes() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'MaxLevelUpHero', String(entindex));
    }
    if (numEntities > 0) {
        Game.EmitSound("UI.Button.Pressed");
    }
}
function ResetSelectedHeroes() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'ResetHero', String(entindex));
    }
    if (numEntities > 0) {
        Game.EmitSound("UI.Button.Pressed");
    }
}
function ShardSelectedHeroes() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'ShardHero', String(entindex));
    }
    if (numEntities > 0) {
        Game.EmitSound("UI.Button.Pressed");
    }
}
function ScepterSelectedHeroes() {
    var entities = Players.GetSelectedEntities(0);
    //$.Msg( "Entities = " + entities );
    var numEntities = Object.keys(entities).length;
    //$.Msg( "Num entities = " + numEntities );
    for (var i = 0; i < numEntities; i++) {
        var entindex = entities[i];
        if (entindex == -1)
        continue;
        $.DispatchEvent('FireCustomGameEvent_Str', 'ScepterHero', String(entindex));
    }
    if (numEntities > 0) {
        Game.EmitSound("UI.Button.Pressed");
    }
}
function ToggleHeroActive() {
    //$.Msg( 'ToggleHeroActive()' )
}
function MouseOverRune(strRuneID, strRuneTooltip) {
    var runePanel = $('#' + strRuneID);
    runePanel.StartAnimating();
    $.DispatchEvent('UIShowTextTooltip', runePanel, strRuneTooltip);
}
function MouseOutRune(strRuneID) {
    var runePanel = $('#' + strRuneID);
    runePanel.StopAnimating();
    $.DispatchEvent('UIHideTextTooltip', runePanel);
}
function SlideThumbActivate() {
    var slideThumb = $.GetContextPanel();
    var bMinimized = slideThumb.BHasClass('Minimized');
    if (bMinimized) {
        Game.EmitSound("ui_settings_slide_out");
    }
    else {
        Game.EmitSound("ui_settings_slide_in");
    }
    slideThumb.ToggleClass('Minimized');
}
function FixHeroPanels(PanelID) {
    var _a, _b, _c, _d;
    let main_panel = $(PanelID);
    let heroes = (_a = main_panel.FindChildTraverse("HeroPicker")) === null || _a === void 0 ? void 0 : _a.FindChildTraverse("HeroList");
    for (let i = 0; i < heroes.GetChildCount(); i++) {
        for (let j = 0; j < heroes.GetChild(i).GetChildCount(); j++) {
            let panel = (_b = heroes === null || heroes === void 0 ? void 0 : heroes.GetChild(i)) === null || _b === void 0 ? void 0 : _b.GetChild(j);
            panel.GetChild(0).SetImage('file://{images}/custom_game/heroes/selection/' + panel.id + '.png');
            panel === null || panel === void 0 ? void 0 : panel.GetChild(0).SetScaling("stretch-to-cover-preserve-aspect");
            panel === null || panel === void 0 ? void 0 : panel.style.width = "100px";
            panel === null || panel === void 0 ? void 0 : panel.style.height = "160px";
            (_c = panel === null || panel === void 0 ? void 0 : panel.GetChild(0)) === null || _c === void 0 ? void 0 : _c.style.width = "100px";
            (_d = panel === null || panel === void 0 ? void 0 : panel.GetChild(0)) === null || _d === void 0 ? void 0 : _d.style.height = "160px";
        }
    }
}