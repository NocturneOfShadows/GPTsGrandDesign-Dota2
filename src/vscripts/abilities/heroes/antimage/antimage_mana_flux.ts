import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

@registerAbility()
export class antimage_mana_flux extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_antimage_mana_flux";
    }

    /****************************************/

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number {
        return this.GetSpecialValueFor("radius");
    }
}

@registerModifier()
export class modifier_antimage_mana_flux extends BaseModifier {

    radius: number = 0;
    duration: number = 0;
    damage_table?: ApplyDamageOptions;

    /****************************************/

    IsHidden(): boolean                 {return true}
    IsPurgable(): boolean               {return false}
    GetAttributes(): ModifierAttribute  {return ModifierAttribute.PERMANENT}

    /****************************************/

    OnCreated(params: object): void {
        if (!IsServer()) return;

        let ability = this.GetAbility()!;

        this.radius = ability.GetSpecialValueFor("radius");
        this.duration = ability.GetSpecialValueFor("duration");

        this.damage_table = {
            attacker: this.GetParent(),
            victim: this.GetParent(),
            damage: ability.GetSpecialValueFor("damage"),
            damage_type: ability.GetAbilityDamageType(),
            ability: ability
        }

        this.StartIntervalThink(FrameTime());
    }

    /****************************************/

    OnRefresh(params: object): void {
        if (!IsServer()) return;
        let ability = this.GetAbility()!;

        this.radius = ability.GetSpecialValueFor("radius");
        this.duration = ability.GetSpecialValueFor("duration");

        this.damage_table = {
            attacker: this.GetParent(),
            victim: this.GetParent(),
            damage: ability.GetSpecialValueFor("damage"),
            damage_type: ability.GetAbilityDamageType(),
            ability: ability
        }
    }

    /****************************************/

    OnIntervalThink(): void {
        let parent = this.GetParent();
        let ability = this.GetAbility();

        if (ability == undefined || !ability.IsCooldownReady()) return;

        let enemies = FindUnitsInRadius(
            parent.GetTeam(),
            parent.GetAbsOrigin(),
            undefined,
            this.radius,
            UnitTargetTeam.ENEMY,
            ability.GetToggleState() ? UnitTargetType.HERO + UnitTargetType.BASIC : UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        enemies.forEach(enemy => {
            this.damage_table!.victim = enemy;
            ApplyDamage(this.damage_table!);

            enemy.AddNewModifier(this.GetCaster(), ability, "modifier_antimage_mana_flux_silence", {duration: this.duration * (1 - enemy.GetStatusResistance())});
        });

        ability.UseResources(false, false, false, true);
    }
}

@registerModifier()
export class modifier_antimage_mana_flux_silence extends BaseModifier {
    
    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {[ModifierState.SILENCED]: true}    
    }

    /****************************************/

    GetEffectName(): string {
        return "particles/generic_gameplay/generic_silence.vpcf";
    }

    /****************************************/

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }

    /****************************************/

    ShouldUseOverheadOffset(): boolean {
        return true;
    }
}