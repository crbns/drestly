import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

// Upload the original image and create the row. Returns the new item's id so
// the caller can subscribe to its status. Shows up immediately as "processing".
export async function addItem(fileBlob: ArrayBuffer): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User is undefined or null.');

  // crypto.randomUUID() is not available in Hermes — use expo-crypto.
  const itemId = Crypto.randomUUID();
  const path = `${user.id}/${itemId}.jpg`;

  // upload the original (RLS lets the user write only their own folder)
  const { error: uploadError } = await supabase.storage
    .from('originals')
    .upload(path, fileBlob, { contentType: 'image/jpeg' });
  if (uploadError) throw uploadError;

  // insert the row
  const { error: insertError } = await supabase
    .from('clothing_items')
    .insert({ id: itemId, user_id: user.id, original_path: path });
  if (insertError) throw insertError;

  return itemId;
}

// Kick off the background cutout for an already-inserted item. Call this only
// after subscribing to the row, otherwise the UPDATE can fire before you listen.
export async function triggerProcessing(itemId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Session is undefined or null.');

  const res = await fetch(`${process.env.EXPO_PUBLIC_SERVICE_URL}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ item_id: itemId }),
  });
  if (!res.ok) throw new Error(`Process request failed: ${res.status}`);
}
