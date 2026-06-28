---
title: 'Apache Spark, the new way!'
description: 'A practical look at running Apache Spark on Kubernetes, from cluster setup to submitting a Pi job.'
pubDate: 2019-03-30
tags: ['bigdata', 'spark', 'jupyter', 'kubernetes']
---

# BigData analytics on Kubernetes

Big data has been a big topic since 2009. Every company is seeking to process and extract information from the data that it stores. Making a complete environment, from storing the data to presenting it in a simple way, has been very challenging for the past years. A lot of solutions came out in the market filling just a small gap, but when you try to link everything together, the Big Data architecture becomes very complex and involves a lot of different frameworks.

**There are 4 different elements of a big data environment:**

- Storing the data
- Processing the data
- Showing the analysis
- Governing the data

In this short paper we will concentrate only on the second part: processing the data, more specifically processing batch data. There are a lot of processing frameworks out there, like Apache Spark, Apache Flink, Google DataFlow, and Apache Pig. The most conventionally used solution is Apache Spark. I started to use Spark with version 1.5; today the latest version is 2.4.0. A lot of things have improved since back then. Before, running a Spark cluster was not an easy task: either you had a Hadoop cluster and ran Spark using Yarn as a scheduler, or you used Mesos for this purpose. But when you wanted to run only Spark for the time being, the deployment was complex.

## Spark Architecture

Apache Spark is a distributed, horizontally scalable, and fault-tolerant computation framework. It is composed of several workers, a driver, and a cluster manager, also called Spark Master.

The Spark driver coordinates tasks that are executed by the Spark workers.

![Apache Spark architecture](https://spark.apache.org/docs/latest/img/cluster-overview.png)

The workers and the driver exchange data with each other when needed. This exchange of data is done using random ports. This requires the Spark cluster to be in the same network, probably in a unique subnet depending on your company policy.

There are two different ways to run jobs on top of Spark: client mode and cluster mode.

In client mode, the driver will be run outside of the cluster, generally on the client that starts the job.

In cluster mode, the Spark driver will run on one Spark worker. All the workers will need to have all libraries accessible or installed.

When you use a Data Science studio (commonly called a notebook) that uses a Spark Cluster, this notebook will hold the Spark Driver.

## The new way of deploying Apache Spark

Docker containers are more and more used in daily IT work. Running Spark in containers was the obvious way to go since it helps the deployment, but it also added complexity. Spark itself is very good, but to develop analytics algorithms you need a nice interface to interact with the data. Spark does not provide that. Jupyter does, but Jupyter is not natively integrated with Spark. Integrating them together using containers was tough because Jupyter needed to run the Spark driver.

A solution came out using [Apache Livy](https://livy.incubator.apache.org/). Jupyter does not need to run the Spark driver anymore since Livy runs it, and Jupyter uses SparkMagic to talk to Livy using HTTP/HTTPS. This solution is great, but you cannot control Spark as you would like, and it adds another framework to manage.

Since [Spark release v2.2.0](https://apache-spark-on-k8s.github.io/userdocs/running-on-kubernetes.html), the developers did a fantastic job. They worked alongside the Kubernetes APIs to start Spark in containers. The Spark driver starts and stops worker pods when needed. In cluster mode, the Spark driver gets its own pod. When the Spark tasks are completed, the driver no longer consumes resources.

![Spark K8s Architecture](https://spark.apache.org/docs/2.3.0/img/k8s-cluster-mode.png)

## How to deploy Spark and Jupyter in Kubernetes

Well, the first thing you need is a Kubernetes cluster, right? In the following examples we will use AWS EKS, AWS’s managed Kubernetes cluster. You can also run it directly on [Minikube](https://kubernetes.io/docs/setup/minikube/), but we will not explain that here.

### Cluster creation

To create the EKS cluster, we will use [Terraform](https://www.terraform.io/) to provision an AWS VPC with 3 public subnets to hold our Kubernetes minions.

**To create the VPC we will use a Terraform module:**

``` javascript
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "vpc-k8s-cluster"

  cidr = "10.11.0.0/16"

  azs             = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  private_subnets = ["10.11.1.0/24", "10.11.2.0/24", "10.11.3.0/24"]

  enable_dns_hostnames = true
  enable_dns_support   = true
  default_vpc_enable_dns_hostnames = true

  tags = {
    Owner       = "Chuck Norris"
    Environment = "test"
  }

  vpc_tags = {
    Name = "vpc-k8s-cluster"
  }
}
```

**We create the repositories for our Jupyter and Spark worker images:**

``` javascript
resource "aws_ecr_repository" "spark_img" {
  name = "spark"
}
resource "aws_ecr_repository" "jupyter_img" {
  name = "jupyter"
}
```

**Then we create the EKS cluster:**

``` javascript
module "my-cluster" {
  source       = "terraform-aws-modules/eks/aws"
  cluster_name = "my-cluster"
  subnets      = "${module.vpc.public_subnets}"
  vpc_id       = "${module.vpc.vpc_id}"

  worker_groups = [
    {
      instance_type = "m5.large"
      asg_max_size  = 5
      worker_group_count = "2"
    }
  ]

  tags = {
    environment = "test"
  }
}
```

### Deploy Jupyter in Kubernetes

Jupyter will create and delete containers inside Kubernetes. If you have [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) enabled, you need to create a Role that will be used by Jupyter to handle resources inside Kubernetes.

``` yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
 namespace: default
 name: jupyter-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list", "edit", "create", "delete"]
```

Then you need to link the role to a ServiceAccount that can be used by the Jupyter pods:

``` yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: jupyter-sa
---
apiVersion: v1
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: jupyter-role-binding
roleRef:
  kind: Role
  name: jupyter-role
  apiGroup: ""
subjects:
- kind: ServiceAccount
  name: jupyter-sa
  namespace: default
```

And then create a deployment for Jupyter:

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jupyter
spec:
  selector:
    matchLabels:
      app: jupyter
  replicas: 1
  template:
    metadata:
      labels:
        app: jupyter
    spec:
      serviceAccountName: jupyter-sa
      containers:
      - name: server
        image: "REPLACE_THIS_BY_YOUR_JUPYTER_IMAGE_URI"
        ports:
        - name: jupyter-port
          containerPort: 8888
```

Expose Jupyter as a Kubernetes service. You could deploy this service with the load balancer type, but we will use Kubernetes port-forward capabilities to log in to the container later on.

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: jupyter
  labels:
    app: jupyter
spec:
  type: ClusterIP
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: jupyter-port
  selector:
    app: jupyter
```

## Log to Jupyter

Now our Jupyter notebook should be running in Kubernetes. To log in to the notebook, we need to access it via HTTP. To simplify this paper, we will use Kubernetes port-forward to expose the container port to our localhost.

``` bash
kubectl --kubeconfig=kubeconfig_my-cluster port-forward deployment/jupyter 8888:8888
```

Now Jupyter is asking for a token, this token can be found in the logs of the container:

``` bash
kubectl --kubeconfig=kubeconfig_my-cluster logs deployment/jupyter | grep token
```

## Create some interesting computation over Spark

For the purpose of this paper, we will calculate Pi number. Create a new notebook and insert the following code

``` python
from __future__ import print_function

import sys
from random import random
from operator import add
import os
import socket
from pyspark.sql import SparkSession

k8s_master='k8s://https://'+os.environ['KUBERNETES_SERVICE_HOST']+':'+os.environ['KUBERNETES_PORT_443_TCP_PORT']
spark_worker_image="<your docker image here>" #todo

os.environ['PYSPARK_PYTHON'] = 'python3'
os.environ['PYSPARK_DRIVER_PYTHON'] = 'python3'

spark = SparkSession.builder.config("spark.app.name", "spark-pi")\
      .master(k8s_master)\
      .config('spark.submit.deployMode', 'client')\
      .config("spark.executor.instances", "2")\
      .config('spark.driver.host', socket.gethostbyname(socket.gethostname()))\
      .config("spark.kubernetes.container.image", spark_worker_image)\
      .getOrCreate()
```

In the code above, we get the Kubernetes API via the environment variables that are set by Kubernetes on the pod: `KUBERNETES_SERVICE_HOST` and `KUBERNETES_PORT_443_TCP_PORT`.

After that we specify the version of Python we want to use. By default, Python 2.7 is used by Spark.

The third command indicates the Spark session by specifying the Spark master handled by Kubernetes and some Spark parameters. One important value is `spark.driver.host`; this variable tells the Spark workers to communicate with the driver on the IP of the Jupyter container.

The Spark worker should have started and be running. You can verify it using the command:

``` bash
kubectl --kubeconfig=kubeconfig_my-cluster get po
```

Lastly just run the calculation of Pi:

``` python
def f(_):
    x = random() * 2 - 1
    y = random() * 2 - 1
    return 1 if x ** 2 + y ** 2 <= 1 else 0

partitions = 2 # we have 2 workers so we use 2 partitions
n = 100000 * partitions

count = spark.sparkContext.parallelize(range(1, n + 1), partitions).map(f).reduce(add)
print("Pi is roughly %f" % (4.0 * count / n))
```

And then end the spark session:

``` python
spark.stop()
```

## Clone me

    git clone https://github.com/markthebault/jupyter-and-spark-on-eks.git

# TODO

- Create a terraform template that generates the jupyter.yaml with the correct ECR uri of jupyter
- Pass the container image for spark in the env environment of the jupyter container \#awesome
