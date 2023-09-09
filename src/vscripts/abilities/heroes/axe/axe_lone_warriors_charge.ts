import { BaseAbility, BaseModifier, BaseModifierMotionHorizontal, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

interface modifier_axe_lone_warriors_charge_object {
    target: EntityIndex
}

@registerAbility()
export class axe_lone_warriors_charge extends BaseAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_marci.vsndevts", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_axe.vsndevts", context);
        PrecacheResource("particle", "particles/units/heroes/hero_marci/marci_rebound_bounce.vpcf", context);
        PrecacheResource("particle", "particles/status_fx/status_effect_beserkers_call.vpcf", context);
    }

    GetCastAnimation(): GameActivity {
        return GameActivity.DOTA_SPAWN
    }

    OnSpellStart(): void {
        let target = this.GetCursorTarget()
        if (!target) { return }
        let caster = this.GetCaster()
        caster.AddNewModifier(caster, this, "modifier_axe_lone_warriors_charge", { target: target.entindex() })

        caster.EmitSound("Hero_Marci.Rebound.Cast")
    }
}

@registerModifier()
export class modifier_axe_lone_warriors_charge extends BaseModifierMotionHorizontal {
    target?: CDOTA_BaseNPC
    speed = 0

    IsPurgable(): boolean { return false }
    IsHidden(): boolean { return true }
    RemoveOnDeath(): boolean { return true }

    OnCreated(params: modifier_axe_lone_warriors_charge_object): void {
        let ability = this.GetAbility()
        if (!ability) { return }
        this.speed = ability.GetSpecialValueFor("charge_speed")

        if (!IsServer()) return;
        this.target = EntIndexToHScript(params.target) as CDOTA_BaseNPC

        if (!this.ApplyHorizontalMotionController()) {
            this.Destroy()
            return;
        }

        this.AddParticle(
            ParticleManager.CreateParticle(
                "particles/units/heroes/hero_marci/marci_rebound_bounce.vpcf",
                ParticleAttachment.ABSORIGIN_FOLLOW,
                ability.GetCaster()
            ),
            true,
            false,
            5,
            false,
            false
        )
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true,
        };
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS,
            ModifierFunction.OVERRIDE_ANIMATION
        ]
    }

    GetActivityTranslationModifiers(): string {
        return "forcestaff_friendly"
    }

    GetOverrideAnimation(): GameActivity {
        return GameActivity.DOTA_FLAIL
    }

    UpdateHorizontalMotion(parent: CDOTA_BaseNPC, dt: number): void {
        if (this.ShouldBeCanceled()) return;

        let distance_vector = this.target!.GetAbsOrigin() - parent.GetAbsOrigin() as Vector
        let direction = distance_vector.Normalized();
        let distance = distance_vector.Length2D();

        let break_distance = 3000
        let hit_distance = 128

        if (distance > break_distance) {
            this.Destroy()
        }

        if (distance < hit_distance) {
            this.AffectTarget()
            this.Destroy()
            return
        }

        parent.FaceTowards(this.target!.GetAbsOrigin());
        parent.SetAbsOrigin(parent.GetAbsOrigin() + this.speed! * direction * dt as Vector);
    }

    OnHorizontalMotionInterrupted(): void {
        this.Destroy();
    }

    ShouldBeCanceled(): boolean {
        let parent = this.GetParent();
        if (parent.IsStunned() || parent.IsHexed() || parent.IsRooted() || !this.target || this.target.IsNull() || !this.target.IsAlive()) {
            this.Destroy();
            return true;
        }

        return false;
    }

    AffectTarget() {
        if (!IsServer()) { return }
        if (!this.target) { return }
        let ability = this.GetAbility()
        if (!ability) { return }
        let damage = ability.GetSpecialValueFor("damage")
        let duration = ability.GetSpecialValueFor("taunt_duration")
        let caster = ability.GetCaster()
        ApplyDamage({
            attacker: caster,
            damage: damage,
            damage_type: ability.GetAbilityDamageType(),
            victim: this.target,
            ability: ability,
            damage_flags: DamageFlag.NONE
        })
        this.target.AddNewModifier(caster, ability, "modifier_axe_lone_warriors_charge_taunt", { duration: duration })

        this.target.EmitSound("Hero_Marci.Rebound.Damage")
        caster.EmitSound("Hero_Axe.Berserkers_Call")
    }
}

@registerModifier()
export class modifier_axe_lone_warriors_charge_taunt extends BaseModifier {
    IsPurgable(): boolean { return false }

    OnCreated(params: object): void {
        if (!IsServer()) return;
        let caster = this.GetCaster()
        if (!caster) { return }
        let parent = this.GetParent()
        ExecuteOrderFromTable({
            OrderType: UnitOrder.ATTACK_TARGET,
            UnitIndex: parent.entindex(),
            TargetIndex: caster.entindex(),
            Queue: false
        })

        parent.SetForceAttackTarget(caster);
        this.StartIntervalThink(0.1)

        this.AddParticle(
            ParticleManager.CreateParticle(
                "particles/status_fx/status_effect_beserkers_call.vpcf",
                ParticleAttachment.ABSORIGIN,
                undefined
            ),
            true,
            true,
            10,
            false,
            false,
        )
    }

    OnIntervalThink(): void {
        let caster = this.GetCaster()!;
        if (!caster.IsAlive() || (caster.GetAbsOrigin() - this.GetParent().GetAbsOrigin() as Vector).Length2D() > 2000) {
            this.Destroy();
        }
    }

    OnDestroy(): void {
        if (!IsServer()) return;
        this.GetParent().SetForceAttackTarget(undefined);
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.TAUNTED]: true
        };
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_beserkers_call.vpcf";
    }

    StatusEffectPriority(): ModifierPriority {
        return ModifierPriority.HIGH;
    }
}