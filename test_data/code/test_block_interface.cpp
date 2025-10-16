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
    CGffBlock *gff_module[4];

    Port *GFD_GIA_draw_cmd_port[4] = {nullptr};
    Port *GIA_GFD_drawdone_port[4] = {nullptr};
    Port *CE_XGF_draw_cmd_port = nullptr;

    void xmodel_connect()
    {
        for (int i = 0; i < 4; i++)
        {
            Xgf_ptr_obj.GFD_GIA_draw_cmd_port[i] = new Port(128, "dpc" + to_string(i) + "_gfd_gia_draw_cmd.model_vec");
            Xgf_ptr_obj.DSD_GSD_draw_port[i] = new Port(128, "dpc" + to_string(i) + "_dsd_gsd_draw.model_vec");
            Xgf_ptr_obj.LSD_PAI_draw_port[i] = new Port(128, "dpc" + to_string(i) + "_lsd_pai_draw.model_vec");
            Xgf_ptr_obj.GIA_VSD_draw_port[i] = new Port(128, "dpc" + to_string(i) + "_gia_vsd_draw.model_vec");
            Xgf_ptr_obj.VSD_HSD_draw_port[i] = new Port(128, "dpc" + to_string(i) + "_vsd_hsd_draw.model_vec");
        }
        for (int i = 0; i < 4; i++)
        {
            ptr_obj->pGfdBlock->ConnectPort(ptr_obj->GFD_GIA_draw_cmd_port[i],
                                            ptr_obj->pGfdBlock->GFD_GFP_draw_cmd_Tx[i],
                                            ptr_obj->gia_module[i]->GFD_GFP_draw_cmd_Rx);

            ptr_obj->pGfdBlock->ConnectPort(ptr_obj->DSD_GSD_draw_cmd_port[i],
                                            ptr_obj->dsd_module[i]->GFD_GFP_draw_cmd_Tx,
                                            ptr_obj->gsd_module[i]->GFD_GFP_draw_cmd_Rx);

            ptr_obj->pGfdBlock->ConnectPort(ptr_obj->LSD_PAI_draw_cmd_port[i],
                                            ptr_obj->lsd_module[i]->GFD_GFP_draw_cmd_Tx,
                                            ptr_obj->pai_module[i]->GFD_GFP_draw_cmd_Rx);
        }
    }
};