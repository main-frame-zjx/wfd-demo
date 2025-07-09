struct Xgf_ptr_object
{
    CGfdBlock *pGfdBlock;
    CGfdBlock *gia_module[4];
    CGfdBlock *vsd_module[4];
    CGfdBlock *hsd_module[4];
    CGfdBlock *gtf_module[4];
    CGfdBlock *dsd_module[4];
    CGfdBlock *gsd_module[4];
    CGfdBlock *lsd_module[4];
    CGfdBlock *pai_module[4];
    CGfdBlock *gff_module[4];

    Port *GIA_GFD_drawdown_port[4] = {nullptr};
    Port *GIA_GFD_drawdown_port_cp[4] = {nullptr};

    void xmodel_connect()
    {
        for (int i = 0; i < 4; i++)
        {
            Xgf_ptr_obj.GIA_GFD_drawdown_port[i] = new Port(128, "dpc" + to_string(i) + "_gfd_gia_draw_cmd.model_vec");
            Xgf_ptr_obj.GIA_GFD_drawdown_port_cp[i] = new Port(128, "dpc" + to_string(i) + "_dsd_gsd_draw.model_vec");
            Xgf_ptr_obj.LSD_PAI_draw_port[i] = new Port(128, "dpc" + to_string(i) + "_lsd_pai_draw.model_vec");
            Xgf_ptr_obj.GIA_VSD_draw_port[i] = new Port(128, "dpc" + to_string(i) + "_gia_vsd_draw.model_vec");
            Xgf_ptr_obj.VSD_HSD_draw_port[i] = new Port(128, "dpc" + to_string(i) + "_vsd_hsd_draw.model_vec");
        }
        for (int i = 0; i < 4; i++)
        {
            ptr_obj->pGfdBlock->ConnectPort(ptr_obj->GIA_GFD_drawdown_port[i],
                                            ptr_obj->pGfdBlock->GFD_GFP_draw_cmd_Tx[i],
                                            ptr_obj->gia_module[i]->GFD_GFP_draw_cmd_Rx);

            ptr_obj->pGfdBlock->ConnectPort(ptr_obj->GIA_GFD_drawdown_port_cp[i],
                                            ptr_obj->dsd_module[i]->GFD_GFP_draw_cmd_Tx,
                                            ptr_obj->gsd_module[i]->GFD_GFP_draw_cmd_Rx);
        }
    }
};