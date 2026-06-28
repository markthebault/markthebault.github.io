---
title: 'Get connected! Transit VPC on AWS'
description: 'A lightweight Transit VPC setup on AWS using VyOS to connect multiple VPCs through VPN tunnels.'
pubDate: 2018-08-04
tags: ['aws', 'network', 'vpc', 'transitvpc', 'vyos']
---

# Open Source Transit VPC on AWS

This project will set up the necessary elements to create a transit VPC. I will include a Packer step to build our router image. This router will be based on [VyOS 1.1.7](https://vyos.io). The AMI can also be found on the AWS Marketplace for a very decent price.

Terraform will be used to provision the infrastructure. Combined with Python scripts, Terraform will also generate the IPSec configuration. The IPSec configuration will be pushed by SSH, so make sure your private key is added to your SSH agent.

![Transit VPC Schemas](https://github.com/markthebault/transit-vpc-aws-vyos/raw/master/transit-VPC-with-Vyos.png)

## Before starting

You need to install `terraform`, `packer`, and some Python libraries: `pip install -r tools/requirements.txt`.

**Clone the repo:**

    git clone https://github.com/markthebault/aws-swarm-cluster-for-production.git

## Run all

You can deploy everything by running `make all` at the project root. This sequentially runs:

- `vyos-image`: create a VPC, build the AMI, and tear down the VPC
- `terraform-network`: create the whole environment
- `vpn-generated-configurations`: push the VPN configuration into our VyOS router :)

## VyOS generation

In order to allow packer to build our AMI, packer needs to create an instance in a public subnet to boot and install the necessary dependencies for running VyOS.

A simple Terraform VPC is provided to allow Packer to deploy an instance. When the AMI is created, the Terraform environment will be destroyed. This image is region-dependent; if you change the region of your project, you will need to rebuild the image.

## Transit VPC environment

For our case we will build 3 different VPCs: two normal VPCs and one transit VPC. In the transit VPC, the VyOS instance(s) will be deployed in the public subnets. Choose your instance type wisely if you are adapting this project for production, because IPSec is very CPU-consuming. A `C series` instance is a better choice.

On the other VPCs, we deploy an instance in each VPC in order to perform a ping.

## Generate the SSH configuration

Terraform extracts the VPN configuration from the `VPN connections` on AWS. These configurations are in XML, so we need to convert them into Vyatta. An XSLT sheet is available in `tools/vyatta.xsl` to convert the XML into a simple Vyatta format. Then a Python script converts the Vyatta configuration for use in the VyOS system. While running, this script also registers the BGP routes to share. This script is based on the [following repo](https://github.com/mboret/aws-vyos).

If you add a new VPC, don’t forget to change the interfaces in the configuration. I performed this operation by using `sed` in the second Terraform template to generate the configuration: `terraform-network/vpc-2.tf line: 53`.

## Improvements

I am not a network engineer, so the VyOS configuration might not be optimal. So far, what I found missing from this project is:

- Redundancy for the VyOS instance in a different AZ
- Another VPC with shared services such as LDAP, DNS, and proxies
- Logging on the VyOS
- Storing the VPN configuration in an S3 bucket connected with a push event to Lambda that executes a command on the VyOS to add the new VPN configuration
