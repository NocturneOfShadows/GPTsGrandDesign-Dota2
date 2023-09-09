import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

@registerAbility()
export class axe_red_mist_armor extends BaseAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_centaur/centaur_return.vpcf", context);
    }

    GetIntrinsicModifierName(): string {
        return "modifier_axe_red_mist_armor"
    }

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number {
        return this.GetSpecialValueFor("effect_radius")
    }
}

@registerModifier()
export class modifier_axe_red_mist_armor extends BaseModifier {
    armor_per_stack = 0
    effect_radius = 0

    IsHidden(): boolean { return false }
    IsDebuff(): boolean { return false }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_TAKEDAMAGE,
            ModifierFunction.PHYSICAL_ARMOR_BONUS
        ]
    }

    OnCreated(params: object): void {
        let ability = this.GetAbility()
        if (!ability) { return }
        this.armor_per_stack = ability.GetSpecialValueFor("bonus_armor_per_hero")
        this.effect_radius = ability.GetSpecialValueFor("effect_radius")
    }

    OnRefresh(params: object): void {
        this.OnCreated(params)
    }

    OnTakeDamage(event: ModifierInstanceEvent): void {
        let parent = this.GetParent()
        if (event.unit !== parent) { return }
        let ability = this.GetAbility()
        if (!ability) { return }
        if (UnitFilter(event.attacker, ability.GetAbilityTargetTeam(), ability.GetAbilityTargetType(), UnitTargetFlags.NONE, parent.GetTeamNumber()) !== UnitFilterResult.SUCCESS) { return }

        let damage_mod = ability.GetSpecialValueFor("return_damage_perc")
        let return_damage = event.original_damage * damage_mod / 100

        ApplyDamage({
            attacker: parent,
            damage: return_damage,
            damage_type: event.damage_type,
            victim: event.attacker,
            ability: ability,
            damage_flags: event.damage_flags + DamageFlag.REFLECTION
        })

        //Effects
        let return_effect = ParticleManager.CreateParticle("particles/units/heroes/hero_centaur/centaur_return.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, parent)
        ParticleManager.SetParticleControlEnt(return_effect, 0, parent, ParticleAttachment.ABSORIGIN_FOLLOW, "attach_hitloc", Vector(0, 0, 0), false)
        ParticleManager.SetParticleControlEnt(return_effect, 1, event.attacker, ParticleAttachment.ABSORIGIN_FOLLOW, "attach_hitloc", Vector(0, 0, 0), false)
    }

    GetModifierPhysicalArmorBonus(event: ModifierAttackEvent): number {
        return this.GetStackCount() * this.armor_per_stack
    }

    IsAura(): boolean {
        return true
    }

    GetAuraDuration(): number {
        return 0
    }

    GetAuraRadius(): number {
        return this.effect_radius
    }

    IsAuraActiveOnDeath(): boolean {
        return false
    }

    GetAuraSearchTeam(): UnitTargetTeam {
        return UnitTargetTeam.ENEMY
    }

    GetAuraSearchType(): UnitTargetType {
        return UnitTargetType.HERO
    }

    GetModifierAura(): string {
        return "modifier_axe_red_mist_armor_aura"
    }

    OnTooltip(): number {
        return this.GetStackCount() * this.armor_per_stack
    }
}

@registerModifier()
export class modifier_axe_red_mist_armor_aura extends BaseModifier {
    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let caster = this.GetCaster()
        if (!caster) { return }
        caster.FindModifierByName("modifier_axe_red_mist_armor")?.IncrementStackCount()
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let caster = this.GetCaster()
        if (!caster) { return }
        caster.FindModifierByName("modifier_axe_red_mist_armor")?.DecrementStackCount()
    }
}