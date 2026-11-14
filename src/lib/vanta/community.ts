export type LfgStatus = "open" | "closed";

export type LfgPost = {
  id: string;
  playerId: string;
  tribeId?: string;
  region: string;
  mode: string;
  title: string;
  note: string;
  createdAt: string;
  status: LfgStatus;
};

export type LfgCreateInput = {
  playerId: string;
  tribeId?: string;
  region: string;
  mode: string;
  title: string;
  note: string;
};

export type LfgStore = {
  list: () => LfgPost[];
  create: (input: LfgCreateInput) => LfgPost;
  close: (id: string, playerId: string) => boolean;
  join: (id: string, playerId: string) => { ok: true } | { ok: false; error: string };
};

export type TicketCategory = "report" | "appeal" | "support" | "partnership";

export type TicketStatus = "open" | "resolved";

export type Ticket = {
  id: string;
  playerId: string;
  category: TicketCategory;
  subject: string;
  body: string;
  createdAt: string;
  status: TicketStatus;
};

export type TicketCreateInput = {
  playerId: string;
  category: TicketCategory;
  subject: string;
  body: string;
};

export type TicketStore = {
  list: () => Ticket[];
  create: (input: TicketCreateInput) => Ticket;
  resolve: (id: string) => boolean;
};

let lfgCounter = 0;
let ticketCounter = 0;

export function createLfgStore(): LfgStore {
  const posts: LfgPost[] = [];

  return {
    list: () => [...posts],
    create: (input) => {
      const post: LfgPost = {
        id: `lfg_${++lfgCounter}`,
        playerId: input.playerId,
        tribeId: input.tribeId,
        region: input.region,
        mode: input.mode,
        title: input.title,
        note: input.note,
        createdAt: new Date().toISOString(),
        status: "open",
      };
      posts.unshift(post);
      return post;
    },
    close: (id, playerId) => {
      const post = posts.find((p) => p.id === id);
      if (!post) return false;
      if (post.playerId !== playerId) return false;
      post.status = "closed";
      return true;
    },
    join: (id, playerId) => {
      const post = posts.find((p) => p.id === id);
      if (!post) return { ok: false, error: "Post not found." };
      if (post.status !== "open") return { ok: false, error: "Post is closed." };
      if (post.playerId === playerId) return { ok: false, error: "Cannot join your own post." };
      return { ok: true };
    },
  };
}

export function createTicketStore(): TicketStore {
  const tickets: Ticket[] = [];

  return {
    list: () => [...tickets],
    create: (input) => {
      const ticket: Ticket = {
        id: `ticket_${++ticketCounter}`,
        playerId: input.playerId,
        category: input.category,
        subject: input.subject,
        body: input.body,
        createdAt: new Date().toISOString(),
        status: "open",
      };
      tickets.unshift(ticket);
      return ticket;
    },
    resolve: (id) => {
      const ticket = tickets.find((t) => t.id === id);
      if (!ticket) return false;
      ticket.status = "resolved";
      return true;
    },
  };
}
