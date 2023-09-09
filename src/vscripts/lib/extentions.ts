export { }
declare global {
    interface CDOTA_BaseNPC {
        HasShard(): boolean;
    }

    interface C_DOTA_BaseNPC {
        HasShard(): boolean;
    }
}
//Server
if (IsServer()) {
    CDOTA_BaseNPC.HasShard = function () {
        return this.HasModifier("modifier_item_aghanims_shard")
    }
}

//Client
if (!IsServer()) {
    C_DOTA_BaseNPC.HasShard = function () {
        return this.HasModifier("modifier_item_aghanims_shard")
    }
}