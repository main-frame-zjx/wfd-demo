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

    Port *GFD_GIA_draw_cmd_port[4] = {nullptr};
    Port *GIA_GFD_drawdone_port[4] = {nullptr};
    Port *CE_XGF_draw_cmd_port = nullptr;

    void xmodel_connect()
    {
        for (int i = 0; i < 4; i++)
        {
            Xgf_ptr_obj.GFD_GIA_draw_cmd_port[i] = new Port(128, "dpc" + to_string(i) + "_gfd_gia_draw_cmd.model_vec");
        }
        for (int i = 0; i < 4; i++)
        {
            ptr_obj->pGfdBlock->ConnectPort(ptr_obj->GFD_GIA_draw_cmd_port[i],
                                            ptr_obj->pGfdBlock->GFD_GFP_draw_cmd_Tx[i],
                                            ptr_obj->gia_module[i]->GFD_GFP_draw_cmd_Rx);
        }
    }
};