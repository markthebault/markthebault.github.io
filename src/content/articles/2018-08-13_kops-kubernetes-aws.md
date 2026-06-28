---
title: 'Build a Kubernetes cluster with Kops'
description: 'A small Terraform module for preparing the AWS resources needed to build a Kubernetes cluster with kops.'
pubDate: 2018-08-13
tags: ['aws', 'ec2', 'kops', 'kubernetes', 'terraform']
---

# Kubernetes cluster creation using Kops and Terraform

Create the Kubernetes resources with Terraform and generate the cluster configuration with Kops. This repo is an adaptation of [this module](https://github.com/FutureSharks/tf-kops-cluster).

## Get started

Clone the repository and make it yours

    git clone https://github.com/markthebault/kubernetes-kops-terraform.git

## Create the cluster

You need to have Terraform and kops installed on your computer.

``` bash
terraform init
terraform plan --out=plan.out
terraform apply plan.out
cat ~/.kube/config
```

This cluster is private, which means there is no way to access it from the internet. You will need to use a bastion to access the cluster. A bastion host is provided with the key exported under `key.pem`. This key will not be committed, so don’t lose it ;)

## Module usage

The module is located under `./modules/`.

``` javascript
module "kops" {
  source               = "modules/tf-kops-cluster"
  sg_allow_ssh         = "${aws_security_group.allow_ssh.id}"
  sg_allow_http_s      = "${aws_security_group.allow_http.id}"
  cluster_name         = "${var.cluster_name}"
  cluster_fqdn         = "${var.cluster_name}.${aws_route53_zone.main.name}"
  route53_zone_id      = "${aws_route53_zone.main.id}"
  kops_s3_bucket_arn   = "${aws_s3_bucket.kops.arn}"
  kops_s3_bucket_id    = "${aws_s3_bucket.kops.id}"
  vpc_id               = "${module.vpc.vpc_id}"
  instance_key_name    = "${aws_key_pair.generated_key.key_name}"
  internet_gateway_id  = "${module.vpc.igw_id}"
  master_instance_type = "t2.medium"
  node_instance_type   = "t2.medium"
  kubernetes_version   = "${var.kubernetes_version}"
  kops_dns_mode        = "private"

  public_subnet_cidr_blocks = "${var.kubernetes_public_subnets_cidr}" #For the LB
  private_subnet_ids        = "${module.vpc.private_subnets}"
}
```
