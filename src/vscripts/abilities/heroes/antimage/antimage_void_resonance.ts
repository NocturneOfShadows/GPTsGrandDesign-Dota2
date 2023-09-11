import { BaseAbility, BaseModifier, BaseModifierMotionHorizontal, registerAbility, registerModifier } from "../../../lib/dota_ts_adapter"

interface kv {
	x: number;
    y: number;
    z: number;
}

@registerAbility()
export class antimage_void_resonance extends BaseAbility
{

    GetCastAnimation(): GameActivity {
        return GameActivity.DOTA_RUN;
    }

    /****************************************/


    OnSpellStart(): void {        
        CreateModifierThinker(
            this.GetCaster(),
            this,
            "modifier_antimage_void_resonance",
            {duration: this.GetSpecialValueFor("duration")},
            this.GetCursorPosition(),
            this.GetCaster().GetTeam(),
            false
        );
    }
}

@registerModifier()
export class modifier_antimage_void_resonance extends BaseModifierMotionHorizontal
{
    position?: Vector;
    origin?: Vector;
    affected_enemies: Record<EntityIndex, boolean> = {};

    speed: number = 0;
    search_radius: number = 0;
    distance_to_cross?: number;
    duration?: number;

    damage: number = 0;
    mana_burned: number = 0;

    damage_table?: ApplyDamageOptions;

    /****************************************/

    IsPurgable(): boolean       {return false}
    RemoveOnDeath(): boolean    {return true}

    /****************************************/

    OnCreated(params: kv): void {
        if (!IsServer()) return;

        let ability = this.GetAbility()!;
        let parent = this.GetParent();

        this.speed = ability.GetSpecialValueFor("speed");
        this.search_radius = ability.GetSpecialValueFor("effect_radius");
        this.mana_burned = ability.GetSpecialValueFor("mana_burned");

        
        this.origin = parent.GetAbsOrigin();
        this.position = Vector(params.x, params.y, params.z);
        this.distance_to_cross = (this.position - parent!.GetAbsOrigin() as Vector).Length2D();
        this.duration = this.distance_to_cross / this.speed;

        let direction = (this.position - this.origin as Vector).Normalized()

        this.position = this.position + direction * 1000 as Vector;

        if (!this.ApplyHorizontalMotionController()) {
            this.Destroy()
            return;
        }

        this.damage_table = {
            attacker: this.GetParent(),
            victim: this.GetParent(),
            damage: ability.GetSpecialValueFor("damage"),
            damage_type: ability.GetAbilityDamageType(),
            ability: ability
        }

        this.StartIntervalThink(FrameTime());
        this.OnIntervalThink();
    }

    /****************************************/

    OnDestroy(): void {
        if (!IsServer()) return;
        let parent = this.GetParent();

        parent.RemoveHorizontalMotionController(this);
        GridNav.DestroyTreesAroundPoint(parent.GetAbsOrigin(), 150, true);
        FindClearSpaceForUnit(parent, parent.GetAbsOrigin(), true);

        Timers.CreateTimer(FrameTime(), () => {
            if (GridNav.IsBlocked(parent.GetAbsOrigin()))
                FindClearSpaceForUnit(parent, parent.GetAbsOrigin(), true);
        });
    }

    /****************************************/

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true,
         };
    }

    /****************************************/

    UpdateHorizontalMotion(parent: CDOTA_BaseNPC, dt: number): void {
        let position = parent.GetAbsOrigin()
        position.z = 100;

        let direction = (this.position! - position as Vector).Normalized();

        if (this.CheckDistance()) {
            this.Destroy();
            return;
        }

        parent.FaceTowards(this.position!);
        parent.SetAbsOrigin(position + this.speed! * direction * dt as Vector);
    }

    /****************************************/

    OnHorizontalMotionInterrupted(): void {
        this.Destroy();
    }

    /****************************************/

    OnIntervalThink(): void {
        let parent = this.GetParent();
        let ability = this.GetAbility()!;

        let enemies = FindUnitsInRadius(
            parent.GetTeamNumber(),
            parent.GetAbsOrigin(),
            undefined,
            this.search_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            if (!this.affected_enemies[enemy.entindex()]) {
                this.affected_enemies[enemy.entindex()] = true;
                
                this.damage_table!.victim = enemy;
                ApplyDamage(this.damage_table!);

                if (enemy.GetMana() > 0) {
                    enemy.Script_ReduceMana(this.mana_burned, ability);

                    //add shard effect 

                    enemy.EmitSound(enemy.GetManaPercent() < 50 ? "Hero_Antimage.ManaBreak.LowMana" : "Hero_Antimage.ManaBreak");
                    let mana_burn_fx = ParticleManager.CreateParticle("particles/generic_gameplay/generic_manaburn.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, parent);
                    ParticleManager.SetParticleControlEnt(mana_burn_fx, 0, enemy, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", Vector(0, 0, 0), true);
                    ParticleManager.ReleaseParticleIndex(mana_burn_fx);
                }
            }
        }
    }

    /****************************************/

    CheckDistance(): boolean {
        let parent = this.GetParent();
        let distance = (parent.GetAbsOrigin() - this.origin! as Vector).Length2D()

        if (distance + 10 >= this.distance_to_cross!) {
            return true;
        }

        return false;
    }

    /****************************************/

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.OVERRIDE_ANIMATION,
            ModifierFunction.TRANSLATE_ACTIVITY_MODIFIERS,
            ModifierFunction.DISABLE_TURNING
        ]
    }

    /****************************************/

    GetOverrideAnimation(): GameActivity {
        return GameActivity.DOTA_RUN;
    }

    /****************************************/

    GetActivityTranslationModifiers(): string {
        return "haste";
    }

    /****************************************/

    GetModifierDisableTurning(): 0 | 1 {
        return 1;
    }

    /****************************************/

    GetEffectName(): string {
        return "particles/econ/events/ti9/phase_boots_ti9.vpcf";
    }

    /****************************************/

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}