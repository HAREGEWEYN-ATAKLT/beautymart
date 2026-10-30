
import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

const handler = NextAuth(authOptions);

// NextAuth v4 requires direct route exports in App Router. Do not wrap this
// handler; doing so removes its internal catch-all route context.
export { handler as GET, handler as POST };
