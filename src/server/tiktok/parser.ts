export type NormalizedTikTokEvent = {
  rawEvent: string;
  type: "chat" | "gift" | "like" | "follow" | "share" | "join" | "other";
  userId?: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  comment?: string;
  giftName?: string;
  giftId?: string;
  diamondCount?: number;
  repeatCount?: number;
  gifterLevel?: number;
  isMember?: boolean;
  raw: unknown;
};

function getAvatar(user: any, data: any) {
  return (
    user?.avatarUrl ||
    user?.profilePictureUrl ||
    user?.profile_picture_url ||
    user?.avatarThumb?.url_list?.[0] ||
    user?.avatarThumb?.urlList?.[0] ||
    user?.avatarMedium?.url_list?.[0] ||
    user?.avatarMedium?.urlList?.[0] ||
    user?.avatarLarger?.url_list?.[0] ||
    user?.avatarLarger?.urlList?.[0] ||
    data?.avatarUrl ||
    data?.avatar ||
    data?.profilePictureUrl ||
    data?.profile_picture_url
  );
}

function getIsMember(user: any, data: any) {
  const badges = Array.isArray(user?.badges) ? user.badges : [];

  const hasFansBadge = badges.some((badge: any) => {
    const url = String(badge?.url || "").toLowerCase();
    return url.includes("fans_badge") || url.includes("fans");
  });

  return Boolean(
    hasFansBadge ||
      user?.isSubscriber ||
      user?.is_subscriber ||
      user?.isMember ||
      user?.is_member ||
      data?.isSubscriber ||
      data?.is_subscriber ||
      data?.isMember ||
      data?.is_member
  );
}

export function parseTikTokEvent(event: string, data: any): NormalizedTikTokEvent {
  const user = data?.user || {};

  const base = {
    rawEvent: event,
    userId: data?.user_id || data?.userId || user?.id,
    username: data?.user_unique_id || user?.uniqueId || user?.unique_id,
    nickname: user?.nickname || data?.nickname,
    avatar: getAvatar(user, data),
    gifterLevel: Number(user?.level || data?.level || 0),
    isMember: getIsMember(user, data),
    raw: data,
  };

  if (event === "chat" || event === "comment") {
    return {
      ...base,
      type: "chat",
      comment: data?.comment || "",
    };
  }

  if (event === "gift") {
    return {
      ...base,
      type: "gift",
      giftName: data?.giftName || data?.gift_name,
      giftId: data?.giftId || data?.gift_id,
      diamondCount: Number(data?.diamondCount || data?.diamond_count || 0),
      repeatCount: Number(data?.repeatCount || data?.repeat_count || 1),
    };
  }

  if (event === "like") return { ...base, type: "like" };
  if (event === "follow") return { ...base, type: "follow" };
  if (event === "share") return { ...base, type: "share" };
  if (event === "member" || event === "join") return { ...base, type: "join" };

  return {
    ...base,
    type: "other",
  };
}