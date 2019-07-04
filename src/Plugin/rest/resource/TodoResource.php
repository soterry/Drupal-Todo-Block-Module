<?php

namespace Drupal\todo\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\rest\ModifiedResourceResponse;

/**
 * Provides a Todo Resource
 *
 * @RestResource(
 *   id = "todo_resource",
 *   label = @Translation("Todo"),
 *   uri_paths = {
 *     "canonical" = "/todo/{todo}",
 *     "https://www.drupal.org/link-relations/create" = "/todo"
 *   }
 * )
 */
class TodoResource extends ResourceBase {

    public function post($data) {
        $task = $data['task'];
        if (strlen($task) == 0) {
            return new ResourceResponse([
                'errno' => 2,
                'error' => $this->t('Please enter task.')
            ]);
        }
        $aiid = $this->getDatabaseConnection()->insert('todo')->fields(['task'], [$task])->execute();
        return new ResourceResponse([
            'errno' => 0,
            'id' => $aiid,
            'task' => $task
        ]);
    }

    public function patch($id, $data) {
        return new ResourceResponse([
            'errno' => $this->getDatabaseConnection()->update('todo')->fields([
                'is_finished' => $data['isFinished'] ? 1 : 0
            ])->where('id = :id', [
                'id' => $id
            ])->execute() > 0 ? 0 : 1
        ]);
    }

    public function delete($id) {
        return new ModifiedResourceResponse(null, $this->getDatabaseConnection()->delete('todo')->where('id = :id', [
                    'id' => $id
                ])->execute() > 0 ? 204 : 500);
    }

    protected function getDatabaseConnection() {
        return \Drupal::database();
    }

}
