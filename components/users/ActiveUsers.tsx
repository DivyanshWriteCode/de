import { useOthers, useSelf } from "@liveblocks/react";
import { Avatar } from "./Avatar";
import { generateRandomName } from "@/lib/utils";

import styles from "./index.module.css"
import { useMemo } from "react";

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  const memorizedUsers = useMemo(() => {
    return (
      <main className="flex items-center justify-center gap-1">
        <div className="flex pl-3">

          {currentUser && (
            <div className="relative ml-8 first:ml-0">
              <Avatar name="You" otherStyles="border-[3px] border-primary-green" />
            </div>
          )}

          {users.slice(0, 3).map(({ connectionId }) => {
            return (
              <Avatar key={connectionId} name={generateRandomName()} otherStyles="-ml-3" />
            );
          })}

          {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}


        </div>
      </main>
    )
  }, [users.length])

  return memorizedUsers;
}
export default ActiveUsers