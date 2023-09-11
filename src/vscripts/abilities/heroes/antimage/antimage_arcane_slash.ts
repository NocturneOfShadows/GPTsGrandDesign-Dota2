import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

@registerAbility()
export class antimage_arcane_slash extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_antimage_arcane_slash_slow";
    }

    /****************************************/

    OnUpgrade(): void {
        if (this.GetLevel() == 1) this.ToggleAutoCast();
    }

    /****************************************/

    GetCastRange(location: Vector, target: CDOTA_BaseNPC | undefined): number {
        return this.GetCaster().Script_GetAttackRange();
    }
}

@registerModifier()
export class modifier_antimage_arcane_slash_slow extends BaseModifier {

    base_damage: number = 0;
    missing_mana_damage: number = 0;

    /****************************************/

    IsHidden(): boolean                 {return true}
    IsPurgable(): boolean               {return false}
    GetAttributes(): ModifierAttribute  {return ModifierAttribute.PERMANENT}

    /****************************************/

    OnCreated(params: object): void {
        if (!IsServer()) return;

        let ability = this.GetAbility()!;

        this.base_damage = ability.GetSpecialValueFor("base_damage");
        this.missing_mana_damage = ability.GetSpecialValueFor("missing_mana_damage");
    }

    /****************************************/

    OnRefresh(params: object): void {
        this.OnCreated(params);
    }

    /****************************************/

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL
        ]
    }

    /****************************************/

    GetModifierProcAttack_BonusDamage_Physical(event: ModifierAttackEvent): number {
        let ability = this.GetAbility()!;
        let attacker = this.GetParent();
        let target = event.target;

        if (attacker == null || target == null || attacker.IsIllusion()) return 0;
        if (attacker.PassivesDisabled() || attacker.IsSilenced() || target.IsBuilding() || target.IsOther() || target.IsDebuffImmune()) return 0;
        if (!ability.IsFullyCastable() || (attacker.GetCurrentActiveAbility() != ability && ability.GetAutoCastState() == false)) return 0;

        if (target.GetManaPercent() < 100 && target.GetMaxMana() > 0) {
            target.EmitSound("Hero_Antimage.Projection");

            let void_fx = ParticleManager.CreateParticle("particles/units/heroes/hero_antimage/antimage_manavoid.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, attacker)
            ParticleManager.SetParticleControlEnt(void_fx, 0, target, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", Vector(0, 0, 0), true);
            ParticleManager.ReleaseParticleIndex(void_fx);
        }

        ability.UseResources(true, false, false, true);

        return this.base_damage + (target.GetMaxMana() - target.GetMana()) * this.missing_mana_damage;
    } 
}