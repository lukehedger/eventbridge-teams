#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EventBridgeTeamsStack } from "../lib/eventbridge-teams-stack";

const app = new cdk.App();

new EventBridgeTeamsStack(app, "EventBridgeTeamsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
