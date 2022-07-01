# Fetal Brain MRI Surface Extraction _ChRIS_ Pipeline

## Abstract

This pipeline does preprocessing and QC around
[pl-fetal-cp-surface-extract](https://github.com/FNNDSC/pl-fetal-cp-surface-extract).

## Installation

First, register the necessary plugins to _ChRIS_.

```shell
# list requried plugins and their versions
grep 'plugin: ' fetal_brain_mri_surface_extraction_pipeline.yml | sed 's/  plugin: //'
```

Next, use [`chrs pipeline-file add`](https://github.com/FNNDSC/chrs/tree/master/chrs#chrs-pipeline-file-add)
to register this pipeline to _ChRIS_.

## Usage

Run the pipeline via the _ChRIS_ "workflows" API using
[`chrs`](https://github.com/FNNDSC/chrs/tree/master/chrs#readme):

```shell
chrs upload --feed "Surface Extraction" --pipeline "Fetal Brain Surface Extraction v1.0.0" my_data/
```

## Example Output Structure

```
chris/feed_2
└── pl-dircopy_13
    ├── data
    │   └── segmentation_to31_final.nii
    │   ├── output.meta.json
    │   └── input.meta.json
    └── pl-nii2mnc-u8_14
        ├── pl-nums2mask_16
        │   ├── data
        │   │   └── segmentation_to31_final.mask.mnc
        │   └── pl-bulk-rename_18
        │       ├── data
        │       │   └── segmentation_to31_final.mask.right.mnc
        │       └── pl-fetal-cp-surface-extract_20
        │           ├── data
        │           │   ├── segmentation_to31_final.mask.right.mnc
        │           │   ├── segmentation_to31_final.mask.right._81920.obj
        │           │   └── segmentation_to31_final.mask.right._81920.extraction.log
        │           ├── pl-surfdisterr_23
        │           │   └── data
        │           │       ├── segmentation_to31_final.mask.right.chamfer.mnc
        │           │       └── segmentation_to31_final.mask.right._81920.disterr.txt
        │           └── pl-smoothness-error_24
        │               └── data
        │                   └── segmentation_to31_final.mask.right._81920.smtherr.txt
        ├── pl-nums2mask_15
        │   ├── data
        │   │   └── segmentation_to31_final.mask.mnc
        │   └── pl-bulk-rename_17
        │       ├── data
        │       │   └── segmentation_to31_final.mask.left.mnc
        │       └── pl-fetal-cp-surface-extract_19
        │           ├── pl-surfdisterr_22
        │           │   └── data
        │           │       ├── segmentation_to31_final.mask.left.chamfer.mnc
        │           │       └── segmentation_to31_final.mask.left._81920.disterr.txt
        │           ├── data
        │           │   ├── segmentation_to31_final.mask.left.mnc
        │           │   ├── segmentation_to31_final.mask.left._81920.obj
        │           │   └── segmentation_to31_final.mask.left._81920.extraction.log
        │           └── pl-smoothness-error_21
        │               └── data
        │                   └── segmentation_to31_final.mask.left._81920.smtherr.txt
        └── data
            ├── segmentation_to31_final.nii2mnc.log
            └── segmentation_to31_final.mnc
```
