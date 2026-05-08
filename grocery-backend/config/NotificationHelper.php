<?php
/**
 * NotificationHelper — Call this from any API to trigger notifications
 * 
 * WHEN TO NOTIFY:
 * ┌────────────────────────┬─────────┬────────────────┐
 * │ Event                  │ Admin   │ Delivery Agent │
 * ├────────────────────────┼─────────┼────────────────┤
 * │ New order placed       │  ✅     │ ✅ (all agents)│
 * │ Order accepted by boy  │  ✅     │ ❌             │
 * │ Order delivered        │  ✅     │ ❌             │
 * │ Order cancelled        │  ✅     │ ❌             │
 * └────────────────────────┴─────────┴────────────────┘
 */
class NotificationHelper {

    /**
     * Create a notification record in the DB
     */
    public static function create($db, $role, $title, $message, $type, $order_id = null, $agent_id = null) {
        $stmt = $db->prepare("INSERT INTO notifications (role, agent_id, title, message, type, order_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sisssi", $role, $agent_id, $title, $message, $type, $order_id);
        return $stmt->execute();
    }

    /**
     * Called when a new order is placed:
     * - Notify Admin
     * - Notify all active Delivery Agents (new order available)
     */
    public static function onNewOrder($db, $order_id, $customer_name, $final_total) {
        // 1. Admin notification
        self::create(
            $db, 'Admin',
            '🛒 New Order Received!',
            "$customer_name placed an order of ₹{$final_total}. Order #ORD-{$order_id}.",
            'new_order', $order_id
        );

        // 2. All delivery agents - broadcast
        self::create(
            $db, 'Delivery Agent',
            '📦 New Order Available!',
            "A new order #ORD-{$order_id} (₹{$final_total}) is ready for pickup.",
            'order_available', $order_id, null // agent_id = null means broadcast to all
        );
    }

    /**
     * Called when a delivery agent accepts an order
     */
    public static function onOrderAccepted($db, $order_id, $agent_name) {
        self::create(
            $db, 'Admin',
            '🚴 Order Picked Up!',
            "$agent_name accepted Order #ORD-{$order_id} and is out for delivery.",
            'order_accepted', $order_id
        );
    }

    /**
     * Called when an order is marked as delivered
     */
    public static function onOrderDelivered($db, $order_id, $agent_name) {
        self::create(
            $db, 'Admin',
            '✅ Order Delivered!',
            "Order #ORD-{$order_id} was successfully delivered by {$agent_name}.",
            'order_delivered', $order_id
        );
    }

    /**
     * Called when an order is cancelled
     */
    public static function onOrderCancelled($db, $order_id) {
        self::create(
            $db, 'Admin',
            '❌ Order Cancelled',
            "Order #ORD-{$order_id} has been cancelled by the customer.",
            'order_cancelled', $order_id
        );
    }
}
?>
