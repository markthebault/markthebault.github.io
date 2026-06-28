---
title: 'Running Docker Swarm in AWS'
description: 'How to bootstrap a production-ready Docker Swarm cluster on AWS with Terraform, Ansible, a bastion host, and a default load balancer.'
pubDate: 2019-03-01
tags: ['docker', 'swarm', 'cluster', 'aws']
---

# Swarm cluster for AWS

Setting up a production-ready Swarm cluster has never been so easy!

This is a bootstrap project, which creates 6 swarm nodes, 3 managers and 3 workers.

All Swarm nodes are in a single private subnet and they have access to internet via a Nat Gateway in the public subnet.

There is also a Bastion Host to configure and SSH the swarm nodes. A default Elastic Load Balancer is created also that listens the traffic on **TCP:3543** of all swarm nodes and load-balances TCP traffic coming from the internet on the **port 80**.

**You can find a more detailed view below:**

![Cloud visual description](https://github.com/markthebault/aws-swarm-cluster-for-production/blob/master/cloud-image.png)

## Get started

**Clone the repo:**

    git clone https://github.com/markthebault/aws-swarm-cluster-for-production.git

## Bootstrapping a Swarm cluster in AWS

This project uses CoreOS alpha images to get the latest Docker updates.

### 1/ Provisioning of the infrastructure

Make sure your environment contains the following variables:

    export AWS_ACCESS_KEY_ID=<your access key>
    export AWS_SECRET_ACCESS_KEY=<your secret key>

Create a file terraform.tfvars in `./terraform`

**Example:**

    control_cidr = "10.234.231.21/32"
    owner = "Mark"
    default_keypair_name = "swarm-clstr-kp"
    default_keypair_path = "~/.ssh/swarm-clstr-kp.pem"

Execute `terraform plan` to see what will be created and `terraform apply` to start terraforming ;)

#### Quick start

To start even faster, run `make up`. This creates the infrastructure and provisions the VMs. To destroy everything, run `make down`.

### 2/ Init the Swarm cluster

All operations are executed by Ansible, so make sure you have your private key in your SSH agent: `ssh-add -K ~/.ssh/swarm-clstr-kp.pem` (on macOS).

Install the Ansible requirement on CoreOS from the `./ansible` folder: `ansible-playbook bootstrap.yml`

Start the cluster: `ansible-playbook init-swarm.yml`

Start [Portainer](http://portainer.io/) if you want a web UI for Docker: `ansible-playbook docker-ui.yml`

### 3/ Run new services

Starting a new service is easy; you can follow [Docker’s tutorials](https://docs.docker.com/engine/reference/commandline/service_create/).

Be aware that the load balancer is only configured to balance traffic from TCP:80 to TCP:3543 on the Swarm instances.

To change the load balancer configuration, edit `./terraform/elb.tf` and don’t forget to change the attached security group.

### 4/ Connect with OpenVPN

You can connect to your Swarm cluster directly with OpenVPN and access the services deployed on it. First, you need to **add the OpenVPN service to the bastion**.

OpenVPN is based on this [github](https://github.com/kylemanna/docker-openvpn).

Run the Ansible playbook: `cd ansible && ansible-playbook bastion.yml`

This automatically creates `/tmp/CLIENTADMIN.conf` with the OpenVPN configuration.

If it fails, you can manually run `./scripts/get-admin-vpn-cert.sh > myconf.conf`.

To create more configuration for your users you can run the script `./scripts/create-client-vpnconf.sh client-name file-name.conf`

### 5/ Monitoring

**This is experimental monitoring**

The monitoring stack was built using [this stack](https://grafana.com/dashboards/609). To run the monitoring, execute `cd ./ansible && ansible-playbook docker-monitoring.yml`. You can also find an example Grafana dashboard in `./monitoring/grafana-dashboard/docker-swarm-container-overview.json`. Grafana is accessible on `http://SWARM_NODE:3543` after you connect to the VPN.

## Optional

### Docker API Accessible via TLS

You can also configure the Docker daemon to be accessible via a remote CLI using TLS.

To enable that feature follow the different steps:

    # After terraform has been applied
    $ cd ./certificate

    # Create the CA certificate and the server certificates
    $ make

    # Create the client certificate
    $ make gen-client-certs CLIENT=client

    # Execute the ansible playbook to enable TLS
    $ cd ../ansible/
    $ ansible-playbook docker-certificates.yml

    # All nodes of your swarm are accessible via TLS like this:
    $ export IP_OF_ONE_NODE=10.43.1.20
    $ docker -H tcp://IP_OF_ONE_NODE:2376 --tlsverify  --tlscacert ../certificates/ca.pem --tlscert ../certificates/clients/client.pem --tlskey ../certificates/clients/client-key.pem info

## Optimizations

- Currently the project works only in one AZ, so that’s not very good for high availability
- The project only supports AWS
