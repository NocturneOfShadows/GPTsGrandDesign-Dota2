LinkLuaModifier("demo_no_damage", "components/demo/demo_no_damage", LUA_MODIFIER_MOTION_NONE)

-----------------------------------------------------------------------------------------

demo_no_damage = class({})

-----------------------------------------------------------------------------------------

function demo_no_damage:DeclareFunctions()
	return {
		MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_MAGICAL,
		MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PHYSICAL,
		MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PURE,
	}
end

-----------------------------------------------------------------------------------------

function demo_no_damage:GetTexture()
	return "modifier_invulnerable"
end

-----------------------------------------------------------------------------------------

function demo_no_damage:GetAbsoluteNoDamageMagical( params )
	return 1
end

-----------------------------------------------------------------------------------------

function demo_no_damage:GetAbsoluteNoDamagePhysical( params )
	return 1
end

-----------------------------------------------------------------------------------------

function demo_no_damage:GetAbsoluteNoDamagePure( params )
	return 1
end