import {
  CreateScheduleCommand,
  CreateScheduleCommandInput,
  DeleteScheduleCommand,
  DeleteScheduleCommandInput,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';

export async function putEvent(eventEntry: CreateScheduleCommandInput) {
  const client = new SchedulerClient({ region: 'ap-south-1' });
  const command = new CreateScheduleCommand(eventEntry);
  return await client.send(command);
}

export async function deleteEvent(eventEntry: DeleteScheduleCommandInput) {
  const client = new SchedulerClient({ region: 'ap-south-1' });
  const command = new DeleteScheduleCommand(eventEntry);
  return await client.send(command);
}
