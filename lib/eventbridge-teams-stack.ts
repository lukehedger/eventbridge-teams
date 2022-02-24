import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  ApiDestination,
  Authorization,
  Connection,
  EventBus,
  EventField,
  Rule,
  RuleTargetInput,
} from "aws-cdk-lib/aws-events";
import { ApiDestination as ApiDestinationTarget } from "aws-cdk-lib/aws-events-targets";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

export class EventBridgeTeamsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { STAGE, TEAMS_WEBHOOK_URL } = process.env;

    if (typeof STAGE === "undefined") {
      throw new Error("STAGE is undefined");
    }

    if (typeof TEAMS_WEBHOOK_URL === "undefined") {
      throw new Error("TEAMS_WEBHOOK_URL is undefined");
    }

    const secret = new Secret(this, `Teams-Secret-${STAGE}`, {
      description:
        "A fake password for MS Teams webhook requests. Teams does not require auth for webhook POST requests",
      secretName: "FakeTeamsSecret",
    });

    const connection = new Connection(this, `Teams-Connection-${STAGE}`, {
      authorization: Authorization.basic(
        "fake-teams-user",
        SecretValue.secretsManager(secret.secretName)
      ),
      description:
        "Connection with fake basic username/password auth. Teams does not require auth for webhook POST requests",
    });

    const destination = new ApiDestination(this, `Teams-Destination-${STAGE}`, {
      connection,
      endpoint: TEAMS_WEBHOOK_URL,
      description: "Calling MS Teams webhook with Basic username/password auth",
    });

    const eventBus = new EventBus(this, `Teams-EventBus-${STAGE}`, {
      eventBusName: "teams-alerts",
    });

    new Rule(this, "Rule", {
      eventBus: eventBus,
      eventPattern: {
        detailType: ["TEAMS_ALERT"],
      },
      targets: [
        new ApiDestinationTarget(destination, {
          // See: https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using
          event: RuleTargetInput.fromObject({
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            text: EventField.fromPath("$.detail.message"),
          }),
        }),
      ],
    });
  }
}
