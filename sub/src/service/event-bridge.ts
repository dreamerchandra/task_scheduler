import {
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';

export async function putEvent(eventEntry: CreateScheduleCommandInput) {
  const client = new SchedulerClient({ region: 'ap-south-1' });
  const command = new CreateScheduleCommand(eventEntry);
  return await client.send(command);
}
