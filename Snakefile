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
# # inner and outer SP surface extraction
# snakemake --cores $(nproc) --use-singularity
#
# # create QC figures
# snakemake --cores $(nproc) --use-singularity qc


# Aliases
# --------------------------------------------------------------------------------

rule sp:
	input: "outersp_surface", "innersp_surface"

rule qc:
	input: "outersp_surface_figures", "innersp_surface_figures"

rule masks:
	input: "wm_mask", "innersp_mask"

rule all:
	input: "outersp_surface", "innersp_surface", "outersp_surface_figures"

# Preprocessing
# --------------------------------------------------------------------------------


rule move_volumes_to_subject_dir:
	input: "segmentations"
	output: directory("subjects")
	container: "docker://ghcr.io/fnndsc/pl-bulk-rename:0.1.2"
	shell:
		"mkdir '{output}' && bulkrename --filter '.*_nuc_deep_subplate_dilate\.nii$' --expression '(.*)_nuc_deep_subplate_dilate\.nii' --replace '$1/labels.nii' {input} {output}"

rule convert_nifti_to_minc:
	input: "subjects"
	output: directory("minc")
	container: "docker://ghcr.io/fnndsc/pl-nii2mnc:1.1.0"
	shell:
		"niis2mncs --unsigned --byte {input} {output}"

rule rm_intermediate:
	shell: "rm -rv ./_*/"

# Mask Extraction
# --------------------------------------------------------------------------------


rule extract_wm_masks:
	input: "minc"
	output: directory("wm_mask")
	container: "docker://ghcr.io/fnndsc/pl-nums2mask:2.0.0"
	shell:
		"nums2mask --mask 'lh.wm.mnc:161,5 rh.wm.mnc:160,4' {input} {output}"

rule extract_innersp_masks:
	input: "minc"
	output: directory("innersp_mask")
	container: "docker://ghcr.io/fnndsc/pl-nums2mask:2.0.0"
	shell:
		"nums2mask --mask 'lh.innersp.mnc:161 rh.innersp.mnc:160' {input} {output}"

# White matter surface extraction
# --------------------------------------------------------------------------------


rule extract_outersp_surface:
	input: "wm_mask"
	output: directory("outersp_surface")
	container: "docker://ghcr.io/fnndsc/pl-fetal-surface-extract:2.1.0"
	shell:
		"extract_cp -J {threads} --target-smoothness 0.13 {input} {output}"

# Inner SP surface deformation
# --------------------------------------------------------------------------------

rule create_innersp_chamfer:
	input: "innersp_mask"
	output: directory("_innersp_chamfer")
	container: "docker://ghcr.io/fnndsc/pl-bichamfer:1.0.1"
	shell:
		"bichamfer {input} {output}"

rule join__innersp_chamfer_and_outerp_surface:
	input: "_innersp_chamfer", "outersp_surface"
	output: directory("_inputs_for_innersp_surface")
	run:
		import os, glob
		from pathlib import Path
		os.mkdir(output[0])
		for input_dir in map(Path, input):
			input_files = filter(lambda p: p.is_file() and not p.name.startswith('.'), input_dir.rglob('*'))
			for input_file in input_files:
				rel = input_file.relative_to(input_dir)
				output_file = Path(output[0]) / rel
				output_file.parent.mkdir(parents=True, exist_ok=True)
				parents = ('..' for _ in rel.parts)
				target = os.path.join(*(*parents, input_dir.name, rel))
				output_file.symlink_to(target)


rule fit_innersp_surface:
	input: "_inputs_for_innersp_surface"
	output: directory("innersp_surface")
	container: "docker://ghcr.io/fnndsc/pl-gifit:0.1.0"
	shell:
		"gifit {input} {output}"

# Outer SP surface extraction QC figures
# --------------------------------------------------------------------------------

rule abs_disterr:
	input: "outersp_surface"
	output: directory("_outersp_surface_with_abs")
	container: "docker://ghcr.io/fnndsc/pl-abs:1.0.1"
	shell:
		"abs --input-files .disterr.txt --copy --output-suffix abs.txt {input} {output}"

rule extract_outersp_surface_figures:
	input: "_outersp_surface_with_abs"
	output: directory("outersp_surface_figures")
	container: "docker://ghcr.io/fnndsc/pl-surfigures:1.2.0"
	shell:
		"surfigures --range '.disterr.txt:-2.0:2.0,.disterr.abs.txt:0.0:2.0,.smtherr.txt:0.0:2.0' {input} {output}"

# Inner SP surface_fit QC figures
# --------------------------------------------------------------------------------

rule innersp_smtherr:
	input: "innersp_surface"
	output: directory("innersp_smtherr")
	container: "docker://ghcr.io/fnndsc/pl-smoothness-error:2.0.2"
	shell:
		"smtherr {input} {output}"

rule join__innersp_smtherr_and_surfaces:
	input: "innersp_surface", "innersp_smtherr"
	output: directory("_innersp_surface_and_smtherr")
	run:
		import os, glob
		from pathlib import Path
		os.mkdir(output[0])
		for input_dir in map(Path, input):
			input_files = filter(lambda p: p.is_file() and not p.name.startswith('.'), input_dir.rglob('*'))
			filtered_files = filter(lambda p: '.gi.' not in p.name, input_files)
			for input_file in filtered_files:
				rel = input_file.relative_to(input_dir)
				output_file = Path(output[0]) / rel
				output_file.parent.mkdir(parents=True, exist_ok=True)
				parents = ('..' for _ in rel.parts)
				target = os.path.join(*(*parents, input_dir.name, rel))
				output_file.symlink_to(target)

rule fit_innersp_surface_figures:
	input: "_innersp_surface_and_smtherr"
	output: directory("innersp_surface_figures")
	container: "docker://ghcr.io/fnndsc/pl-surfigures:1.2.0"
	shell:
		"surfigures --range '.disterr.txt:-2.0:2.0,.disterr.abs.txt:0.0:2.0,.smtherr.txt:0.0:2.0' {input} {output}"
