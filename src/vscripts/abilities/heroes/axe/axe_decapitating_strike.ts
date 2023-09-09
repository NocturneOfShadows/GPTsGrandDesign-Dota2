import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

@registerAbility()
export class axe_decapitating_strike extends BaseAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_axe.vsndevts", context);
        PrecacheResource("particle", "particles/units/heroes/hero_axe/axe_culling_blade.vpcf", context);
    }

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number {

        return this.GetCaster().Script_GetAttackRange()
    }

    GetCastAnimation(): GameActivity {
        return GameActivity.DOTA_CAST_ABILITY_4
    }

    OnSpellStart(): void {
        let target = this.GetCursorTarget()
        if (!target) { return }
        let caster = this.GetCaster()

        let damage = caster.GetHealth() * this.GetSpecialValueFor("health_perc_as_damage") / 100
        ApplyDamage({
            attacker: this.GetCaster(),
            damage: damage,
            damage_type: this.GetAbilityDamageType(),
            victim: target,
            ability: this,
            damage_flags: DamageFlag.NONE,
        })

        if (caster.HasShard()) {
            let heal_amount = damage * this.GetSpecialValueFor("damage_perc_as_heal") / 100
            caster.Heal(heal_amount, this)
        }

        //Effects
        let direction = (target.GetOrigin() - this.GetCaster().GetOrigin() as Vector).Normalized()
        let effect_cast = ParticleManager.CreateParticle("particles/units/heroes/hero_axe/axe_culling_blade.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, target)
        ParticleManager.SetParticleControl(effect_cast, 4, target.GetOrigin())
        ParticleManager.SetParticleControlForward(effect_cast, 3, direction)
        ParticleManager.SetParticleControlForward(effect_cast, 4, direction)
        ParticleManager.ReleaseParticleIndex(effect_cast)

        target.EmitSound("Hero_Axe.Culling_Blade_Fail")
    }
}