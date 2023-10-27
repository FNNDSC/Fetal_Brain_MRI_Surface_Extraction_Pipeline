# ---
# name: Fetal Brain Surface Extraction v1.1.0
# authors: Jennings Zhang <jennings.zhang@childrens.harvard.edu>
# description: Extract inner and outer subplate surfaces from fetal brain MRI segmentation volumes.
# category: MRI
# ---
#
#     INPUT FILES
#
# Input files are fetal brain MRI segmentation as NIFTI files. They must exist in a directory called "segmentations"
# where each input file has the file name "{SUBJECT}_nuc_deep_subplate_dilate.nii"
#
#
#     USAGE
#
# snakemake --cores $(nproc) --use-singularity


rule move_volumes_to_subject_dir:
	input: "segmentations"
	output: directory("subjects")
	container: "docker://ghcr.io/fnndsc/pl-bulk-rename:0.1.2"
	shell:
		"mkdir '{output}' && bulkrename --filter '.*_nuc_deep_subplate_dilate\.nii' --expression '(.*)_nuc_deep_subplate_dilate\.nii' --replace '$1/labels.nii' {input} {output}"

rule convert_nifti_to_minc:
	input: "subjects"
	output: directory("minc")
	container: "docker://ghcr.io/fnndsc/pl-nii2mnc:1.1.0"
	shell:
		"niis2mncs --unsigned --byte {input} {output}"

rule extract_wm_masks:
	input: "minc"
	output: directory("wm_mask")
	container: "docker://ghcr.io/fnndsc/pl-nums2mask:2.0.0"
	shell:
		"nums2mask --mask 'lh.wm.mnc:161,5 rh.wm.mnc:160,4' {input} {output}"

rule extract_outersp_surface:
	input: "wm_mask"
	output: directory("outersp_surface")
	container: "docker://ghcr.io/fnndsc/pl-fetal-surface-extract:2.0.2"  # TODO v2.1.0
	shell:
		"extract_cp --threads {threads} --target-smoothness 0.13 {input} {output}"

rule abs_disterr:
	input: "outersp_surface"
	output: directory("outersp_surface_with_abs")
	container: "docker://ghcr.io/fnndsc/pl-abs:1.0.1"
	shell:
		"abs --input-files .disterr.txt --copy --output-suffix abs.txt {input} {output}"


rule extract_outersp_surface_figures:
	input: "outersp_surface_with_abs"
	output: directory("outersp_surface_figures")
	container: "docker://ghcr.io/fnndsc/pl-surfigures:1.2.0"
	shell:
		"surfigures --range '.disterr.txt:-2.0:2.0,.disterr.abs.txt:0.0:2.0,.smtherr.txt:0.0:2.0' {input} {output}"
