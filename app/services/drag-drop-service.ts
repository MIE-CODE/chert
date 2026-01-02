/**
 * Drag and Drop Service
 * Handles drag and drop business logic
 */

export interface DragDropData {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  type?: "individual" | "group";
  members?: Array<{ id: string; name: string; avatar?: string; isAdmin?: boolean }>;
}

export class DragDropService {
  /**
   * Serializes chat data for drag event
   */
  static serializeChatData(chat: DragDropData): string {
    return JSON.stringify(chat);
  }

  /**
   * Deserializes chat data from drag event
   */
  static deserializeChatData(data: string): DragDropData | null {
    try {
      const parsed = JSON.parse(data);
      if (parsed && parsed.id) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error("Error parsing dropped chat data:", error);
      return null;
    }
  }

  /**
   * Handles drag over event
   */
  static handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }

  /**
   * Handles drop event
   */
  static handleDrop(
    e: React.DragEvent<HTMLDivElement>,
    onDrop: (data: DragDropData) => void
  ): void {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData("application/json");
    const chatData = this.deserializeChatData(data);

    if (chatData) {
      onDrop(chatData);
    }
  }

  /**
   * Sets up drag start event
   */
  static setupDragStart(
    e: React.DragEvent<HTMLDivElement>,
    chat: DragDropData
  ): void {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", this.serializeChatData(chat));
    e.currentTarget.style.opacity = "0.5";
  }

  /**
   * Cleans up drag end event
   */
  static cleanupDragEnd(e: React.DragEvent<HTMLDivElement>): void {
    e.currentTarget.style.opacity = "1";
  }
}

