# AWS VPC Peering Project

## Project Description
This project demonstrates secure private communication between two Amazon Virtual Private Clouds (VPCs) using AWS VPC Peering.

The project includes configuring VPCs, subnets, EC2 instances, route tables, and security groups. Connectivity is tested using ping and SSH through a bastion host to understand secure networking and communication between AWS VPCs.

## Project Objectives
- Create and configure two Amazon VPCs.
- Configure public and private subnets.
- Launch EC2 instances in the required subnets.
- Establish VPC Peering between two VPCs.
- Configure route tables for private communication.
- Configure security groups for secure access.
- Test connectivity using ping and SSH.
- Understand troubleshooting and network security.

## AWS Services Used
- Amazon VPC
- Amazon EC2
- VPC Peering
- Internet Gateway
- Route Tables
- Subnets
- Security Groups

## Project Architecture

### VPC A
- **VPC Name:** ewb-vpc-a
- **CIDR Block:** 10.10.0.0/16
- **Public Subnet:** 10.10.1.0/24
- **Private Subnet:** 10.10.2.0/24
- **Internet Gateway:** ewb-igw-a

### VPC B
- **VPC Name:** ewb-vpc-b
- **CIDR Block:** 10.20.0.0/16
- **Private Subnet:** 10.20.1.0/24

### VPC Peering
- **Peering Connection:** ewb-a-b-peer
- Enables private communication between VPC A and VPC B using private IP addresses.

## EC2 Instances
1. **Bastion Host:** ewb-bastion
2. **Application Instance A:** ewb-app-a
3. **Application Instance B:** ewb-app-b

The application instances use private IP addresses and do not require public IP addresses.

## Implementation Steps
1. Create VPC A and VPC B.
2. Create the required public and private subnets.
3. Configure route tables.
4. Attach an Internet Gateway to VPC A.
5. Launch the EC2 instances.
6. Configure security groups.
7. Create and activate VPC Peering.
8. Add routes for communication between the VPCs.
9. Connect to private instances through the bastion host.
10. Test connectivity using ping and SSH.

## Testing
Connectivity is tested between the application instances using private IP addresses.

- Ping connectivity between App-A and App-B.
- SSH access to private instances through the bastion host.
- Verify communication after configuring VPC Peering.
- Test connectivity after temporarily modifying an ICMP security group rule.
- Restore the security group rule and verify connectivity again.

**Actual testing results and screenshots will be added after completing the AWS implementation.**

## Security
- Restrict SSH access to the required source IP addresses.
- Use security groups to control inbound traffic.
- Keep application instances private.
- Do not expose SSH or ICMP to `0.0.0.0/0`.
- Do not upload AWS credentials or private SSH keys to GitHub.

## Project Outcome
This project helps demonstrate the practical implementation of AWS VPC Peering, private networking, routing, security groups, and secure access to EC2 instances.

## Conclusion
The AWS VPC Peering project provides practical experience in connecting two VPCs securely using private IP addresses. It demonstrates how route tables, security groups, and a bastion host can be used to establish and manage private communication between AWS resources.

## Project Documentation
The repository contains:
- Project report
- Architecture diagram
- AWS configuration screenshots
- Implementation documentation
- Connectivity testing evidence
