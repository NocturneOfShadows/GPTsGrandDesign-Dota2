import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

@registerAbility()
export class axe_generals_command extends BaseAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_axe.vsndevts", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_items.vsndevts", context);
        PrecacheResource("particle", "particles/units/heroes/hero_life_stealer/life_stealer_rage.vpcf", context);
    }

    OnSpellStart(): void {
        let caster = this.GetCaster()
        let duration = this.GetSpecialValueFor("duration")

        caster.AddNewModifier(caster, this, "modifier_axe_generals_command_aura", { duration: duration })

        caster.EmitSound("DOTA_Item.MinotaurHorn.Cast")
        caster.EmitSound("Hero_Axe.Battle_Hunger")
    }

    GetCastAnimation(): GameActivity {
        return GameActivity.DOTA_CAST_ABILITY_2
    }
}

@registerModifier()
export class modifier_axe_generals_command_aura extends BaseModifier {
    effect_radius = 0
    IsHidden(): boolean { return false }
    IsPurgable(): boolean { return false }
    IsDebuff(): boolean { return false }

    OnCreated(params: object): void {
        let ability = this.GetAbility()
        if (!ability) { return }
        this.effect_radius = ability.GetSpecialValueFor("effect_radius")
    }

    IsAura(): boolean { return true }
    IsAuraActiveOnDeath(): boolean {
        return false
    }

    GetAuraDuration(): number {
        return 0.2
    }

    GetAuraEntityReject(entity: CDOTA_BaseNPC): boolean {
        if (entity === this.GetParent()) { return true }
        return false
    }

    GetAuraRadius(): number {
        return this.effect_radius
    }

    GetAuraSearchTeam(): UnitTargetTeam {
        return UnitTargetTeam.FRIENDLY
    }

    GetAuraSearchType(): UnitTargetType {
        return UnitTargetType.HERO
    }

    GetModifierAura(): string {
        return "modifier_axe_generals_command_buff"
    }
}

@registerModifier()
export class modifier_axe_generals_command_buff extends BaseModifier {
    bonus_damage_perc = 0
    bonus_armor_perc = 0
    caster_bonus_damage = 0
    OnCreated(params: object): void {
        let ability = this.GetAbility()
        if (!ability) { return }
        this.bonus_damage_perc = ability.GetSpecialValueFor("bonus_damage_perc")
        this.bonus_armor_perc = ability.GetSpecialValueFor("bonus_armor_perc")

        this.SetHasCustomTransmitterData(true)
        if (!IsServer()) { return }
        this.StartIntervalThink(0.05)

        let overhead_vfx = ParticleManager.CreateParticle("particles/units/heroes/hero_axe/axe_battle_hunger.vpcf", ParticleAttachment.OVERHEAD_FOLLOW, this.GetParent())
        this.AddParticle(overhead_vfx, false, false, -1, false, true)
    }

    OnIntervalThink(): void {
        let caster = this.GetCaster()
        if (!caster) { return }
        let avg_base_damage = (caster.GetDamageMax() + caster.GetDamageMin()) / 2
        let avg_true_damge = caster.GetAverageTrueAttackDamage(undefined)
        this.caster_bonus_damage = avg_true_damge - avg_base_damage
        this.SendBuffRefreshToClients()
    }

    AddCustomTransmitterData() {
        return {
            caster_bonus_damage: this.caster_bonus_damage,
        }
    }

    HandleCustomTransmitterData(data: any) {
        this.caster_bonus_damage = data.caster_bonus_damage
    }


    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PREATTACK_BONUS_DAMAGE,
            ModifierFunction.PHYSICAL_ARMOR_BONUS
        ]
    }

    GetModifierPreAttack_BonusDamage(): number {
        return this.caster_bonus_damage * this.bonus_damage_perc / 100
    }

    GetModifierPhysicalArmorBonus(event: ModifierAttackEvent): number {
        let caster = this.GetCaster()
        if (!caster) { return 0 }
        let bonus_armor = caster.GetPhysicalArmorValue(true)
        return bonus_armor * this.bonus_armor_perc / 100
    }

    OnTooltip(): number {
        return this.caster_bonus_damage * this.bonus_damage_perc / 100
    }

    OnTooltip2(): number {
        let caster = this.GetCaster()
        if (!caster) { return 0 }
        let bonus_armor = caster.GetPhysicalArmorValue(true)
        return bonus_armor * this.bonus_armor_perc / 100
    }
}