import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

@registerAbility()
export class axe_one_man_army extends BaseAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_axe.vsndevts", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_items.vsndevts", context);
        PrecacheResource("particle", "particles/units/heroes/hero_life_stealer/life_stealer_rage.vpcf", context);
    }

    OnSpellStart(): void {
        let caster = this.GetCaster()
        let search_radius = this.GetSpecialValueFor("search_radius")
        let duration_bonus_per_hero = this.GetSpecialValueFor("duration_bonus_per_hero")
        let units = FindUnitsInRadius(caster.GetTeamNumber(), caster.GetAbsOrigin(), undefined, search_radius, UnitTargetTeam.ENEMY, UnitTargetType.HERO, UnitTargetFlags.NONE, FindOrder.ANY, false)
        let duration = this.GetSpecialValueFor("base_duration") + units.length * duration_bonus_per_hero
        caster.AddNewModifier(caster, this, "modifier_axe_one_man_army_buff", { duration: duration })

        caster.EmitSound("Hero_Axe.BerserkersCall.Item.Shoutmask")
        caster.EmitSound("Hero_Axe.Battle_Hunger")
    }

    GetCastAnimation(): GameActivity {
        return GameActivity.DOTA_CAST_ABILITY_1
    }
}

@registerModifier()
export class modifier_axe_one_man_army_buff extends BaseModifier {
    bonus_damage = 0

    IsHidden(): boolean { return false }
    IsDebuff(): boolean { return false }
    IsPurgable(): boolean { return false }

    OnCreated(params: object): void {

        let ability = this.GetAbility()
        if (!ability) { return }
        let parent = this.GetParent()
        this.bonus_damage = ability.GetSpecialValueFor("bonus_damage")

        let rage_vfx = ParticleManager.CreateParticle("particles/units/heroes/hero_life_stealer/life_stealer_rage.vpcf", ParticleAttachment.POINT_FOLLOW, this.GetParent())
        ParticleManager.SetParticleControlEnt(rage_vfx, 0, parent, ParticleAttachment.POINT_FOLLOW, "attach_attack1", parent.GetOrigin(), true)
        ParticleManager.SetParticleControlEnt(rage_vfx, 1, parent, ParticleAttachment.POINT_FOLLOW, "attach_attack2", parent.GetOrigin(), true)
        ParticleManager.SetParticleControlEnt(rage_vfx, 2, parent, ParticleAttachment.CENTER_FOLLOW, "attach_hitloc", parent.GetOrigin(), true)
        this.AddParticle(rage_vfx, false, false, 5, false, false)

        // let overhead_vfx = ParticleManager.CreateParticle("particles/units/heroes/hero_axe/axe_battle_hunger.vpcf", ParticleAttachment.OVERHEAD_FOLLOW, this.GetParent())
        // this.AddParticle(overhead_vfx, false, false, 5, false, true)
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.DEBUFF_IMMUNE]: true
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PREATTACK_BONUS_DAMAGE
        ]
    }

    GetModifierPreAttack_BonusDamage(): number {
        return this.bonus_damage
    }

    OnTooltip(): number {
        return this.bonus_damage
    }
}