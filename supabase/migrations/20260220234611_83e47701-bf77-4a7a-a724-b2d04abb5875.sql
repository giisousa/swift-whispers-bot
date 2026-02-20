
CREATE TABLE public.team_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author TEXT NOT NULL,
  avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  flag TEXT NOT NULL CHECK (flag IN ('urgent', 'high', 'medium', 'low')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages" ON public.team_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON public.team_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update messages" ON public.team_messages FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;
