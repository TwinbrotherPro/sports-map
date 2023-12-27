interface WebhookEvent {
  aspect_type: "update" | "create" | "delete";
  event_time: number;
  object_id: number;
  object_type: "activity" | "athlete";
  owner_id: number;
  subscription_id: number;
  updates: Record<string, string | number>;
}
